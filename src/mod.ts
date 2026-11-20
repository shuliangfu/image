/**
 * @module @dreamer/image
 *
 * @fileoverview 图片处理库 - 服务端实现
 *
 * 提供图片处理、图片转换、图片压缩等功能。
 * 使用 ImageMagick 命令行工具进行图片处理。
 * 如果未安装 ImageMagick，会提示安装方法。
 */

import { $tr, type Locale, setImageLocale } from "./i18n.ts";

import {
  createCommand,
  IS_DENO,
  makeTempDir,
  readFile,
  remove,
  stat,
  writeFile,
} from "@dreamer/runtime-adapter";

/**
 * 图片信息接口
 */
export interface ImageInfo {
  /** 图片宽度（像素） */
  width: number;
  /** 图片高度（像素） */
  height: number;
  /** 图片格式（jpeg、png、webp 等） */
  format: string;
  /** MIME 类型 */
  mimeType: string;
  /** 文件大小（字节） */
  size: number;
  /** EXIF 数据（如果可用） */
  exif?: Record<string, unknown>;
}

/**
 * 图片缩放选项
 */
export interface ResizeOptions {
  /** 目标宽度（像素） */
  width?: number;
  /** 目标高度（像素） */
  height?: number;
  /** 缩放模式 */
  fit?: "contain" | "cover" | "fill" | "inside" | "outside";
  /** 质量（0-100） */
  quality?: number;
}

/**
 * 图片裁剪选项
 */
export interface CropOptions {
  /** 裁剪起始 X 坐标 */
  x: number;
  /** 裁剪起始 Y 坐标 */
  y: number;
  /** 裁剪宽度 */
  width: number;
  /** 裁剪高度 */
  height: number;
}

/**
 * 格式转换选项
 */
export interface ConvertOptions {
  /** 目标格式 */
  format: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif";
  /** 质量（0-100） */
  quality?: number;
}

/**
 * 压缩选项
 */
export interface CompressOptions {
  /** 质量（0-100）
   * - 100：无损压缩（保持原始质量）
   * - < 100：有损压缩（文件更小，质量降低）
   * - 未指定时：根据格式自动判断（PNG/GIF 默认 100，其他默认 80）
   * - 数值越低，文件越小但质量越低
   */
  quality?: number;
  /** 目标格式（支持所有常见格式，可选，默认：jpeg） */
  format?: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif";
}

/**
 * 水印选项
 */
export interface WatermarkOptions {
  /** 水印类型 */
  type: "text" | "image";
  /** 文字内容（当 type 为 "text" 时） */
  text?: string;
  /** 图片数据（当 type 为 "image" 时） */
  image?: Uint8Array | string;
  /** 水印位置 */
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  /** 字体大小（当 type 为 "text" 时） */
  fontSize?: number;
  /** 文字颜色（当 type 为 "text" 时） */
  color?: string;
  /** 透明度（0-1） */
  opacity?: number;
}

/**
 * 图片处理器接口
 */
export interface ImageProcessor {
  /**
   * 缩放图片
   * @param image 图片数据（Uint8Array 或文件路径）
   * @param options 缩放选项
   * @returns 处理后的图片数据
   */
  resize(
    image: Uint8Array | string,
    options: ResizeOptions,
  ): Promise<Uint8Array>;

  /**
   * 裁剪图片
   * @param image 图片数据
   * @param options 裁剪选项
   * @returns 处理后的图片数据
   */
  crop(image: Uint8Array | string, options: CropOptions): Promise<Uint8Array>;

  /**
   * 格式转换
   * @param image 图片数据
   * @param options 转换选项
   * @returns 处理后的图片数据
   */
  convert(
    image: Uint8Array | string,
    options: ConvertOptions,
  ): Promise<Uint8Array>;

  /**
   * 压缩图片
   * @param image 图片数据
   * @param options 压缩选项
   * @returns 处理后的图片数据
   */
  compress(
    image: Uint8Array | string,
    options: CompressOptions,
  ): Promise<Uint8Array>;

  /**
   * 添加水印
   * @param image 图片数据
   * @param options 水印选项
   * @returns 处理后的图片数据
   */
  addWatermark(
    image: Uint8Array | string,
    options: WatermarkOptions,
  ): Promise<Uint8Array>;

  /**
   * 提取图片信息
   * @param image 图片数据
   * @returns 图片信息
   */
  extractInfo(image: Uint8Array | string): Promise<ImageInfo>;
}

/**
 * 图片处理器配置
 */
export interface ImageProcessorOptions {
  /** ImageMagick 命令路径（默认：magick 或 convert） */
  magickPath?: string;
  /** 临时文件目录（默认：系统临时目录） */
  tempDir?: string;
  /** 是否自动尝试安装 ImageMagick（默认：true） */
  autoInstall?: boolean;
  /** 服务端提示/错误文案语言（默认：从环境变量检测） */
  lang?: Locale;
}

/**
 * 获取操作系统类型
 */
function getOS(): "macos" | "linux" | "windows" | "unknown" {
  if (IS_DENO) {
    const os = (globalThis as any).Deno.build.os;
    if (os === "darwin") return "macos";
    if (os === "linux") return "linux";
    if (os === "windows") return "windows";
    return "unknown";
  }

  // Bun 环境使用 process.platform
  const platform = (globalThis as any).process?.platform;
  if (platform === "darwin") return "macos";
  if (platform === "linux") return "linux";
  if (platform === "win32") return "windows";
  return "unknown";
}

/**
 * 尝试自动安装 ImageMagick
 */
async function tryAutoInstall(lang?: Locale): Promise<boolean> {
  const os = getOS();

  try {
    if (os === "macos") {
      // macOS: 尝试使用 brew 安装
      const brewCheck = createCommand("brew", {
        args: ["--version"],
        stdout: "piped",
        stderr: "piped",
      });

      const brewOutput = await brewCheck.output();

      if (brewOutput.success) {
        console.log("🔍", $tr("install.logDetectingBrew"));
        console.log("⏳", $tr("install.logInstallingWait"));

        const installCmd = createCommand("brew", {
          args: ["install", "imagemagick"],
          stdout: "inherit", // 显示安装进度
          stderr: "inherit",
        });

        const installOutput = await installCmd.output();

        if (installOutput.success) {
          console.log("✅", $tr("install.logSuccess", undefined, lang));
          // 等待一下，确保命令可用
          await new Promise((resolve) => setTimeout(resolve, 100));
          return true;
        } else {
          if (installOutput.code === 1) {
            console.warn("⚠️", $tr("install.warnFailAlreadyOrPermission"));
          } else {
            console.warn(
              "⚠️",
              $tr("install.warnFailExitCode", {
                code: String(installOutput.code),
              }),
            );
          }
        }
      } else {
        console.log("ℹ️", $tr("install.logNoBrew"));
      }
    } else if (os === "linux") {
      // Linux: 需要 sudo 权限，无法自动安装
      console.log("ℹ️", $tr("install.logLinuxNeedManual"));
      console.log("💡", $tr("install.logLinuxRunCommands"));
      return false;
    } else if (os === "windows") {
      // Windows: 需要下载安装程序，无法自动安装
      console.log("ℹ️", $tr("install.logWindowsManual"));
      return false;
    }
  } catch (error) {
    console.warn(
      "⚠️",
      $tr("install.warnAutoInstallError", {
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  return false;
}

/**
 * 生成安装提示信息
 */
async function getInstallHint(): Promise<string> {
  const os = getOS();

  let installCommand = "";
  let installUrl = "";

  switch (os) {
    case "macos":
      installCommand = "brew install imagemagick";
      break;
    case "linux":
      // 尝试检测 Linux 发行版
      try {
        // 检查是否有 apt
        const aptCheck = createCommand("apt-get", {
          args: ["--version"],
          stdout: "piped",
          stderr: "piped",
        });
        const aptOutput = await aptCheck.output();
        if (aptOutput.success) {
          installCommand = "sudo apt-get install -y imagemagick";
        } else {
          throw new Error("apt-get not available");
        }
      } catch {
        try {
          // 检查是否有 yum
          const yumCheck = createCommand("yum", {
            args: ["--version"],
            stdout: "piped",
            stderr: "piped",
          });
          const yumOutput = await yumCheck.output();
          if (yumOutput.success) {
            installCommand = "sudo yum install -y ImageMagick";
          } else {
            throw new Error("yum not available");
          }
        } catch {
          installCommand = $tr("install.linuxUsePackageManager");
        }
      }
      break;
    case "windows":
      installUrl = "https://imagemagick.org/script/download.php";
      installCommand = $tr("install.windowsDownload", { url: installUrl });
      break;
    default:
      installCommand = $tr("install.otherOs");
  }

  const border = $tr("install.borderLine");
  let hint = "\n";
  hint += border;
  hint += "  " + $tr("install.notFoundTitle") + "\n";
  hint += border;
  hint += "\n";

  if (os === "macos") {
    hint += "📦 " + $tr("install.macosAuto") + "\n";
    hint += `   ${installCommand}\n\n`;
    hint += "📝 " + $tr("install.macosManual") + "\n";
    hint += "   1. " + $tr("install.macosManual1") + "\n";
    hint += "   2. " +
      $tr("install.macosManual2", { command: installCommand }) +
      "\n\n";
  } else if (os === "linux") {
    hint += "📦 " + $tr("install.linuxCommands") + "\n";
    hint += "   " + $tr("install.linuxCommand", { command: installCommand }) +
      "\n\n";
    hint += "   " + $tr("install.linuxOther") + "\n";
    hint += "   " + $tr("install.linuxArch") + "\n";
    hint += "   " + $tr("install.linuxFedora") + "\n\n";
  } else if (os === "windows") {
    hint += "📦 " + $tr("install.windowsSteps") + "\n";
    hint += "   " + $tr("install.windowsStep1", { url: installUrl }) + "\n";
    hint += "   " + $tr("install.windowsStep2") + "\n";
    hint += "   " + $tr("install.windowsStep3") + "\n";
    hint += "   " + $tr("install.windowsStep4") + "\n\n";
  } else {
    hint += "📦 " + $tr("install.linuxCommands") + "\n";
    hint += "   " + installCommand + "\n\n";
  }

  hint += "💡 " + $tr("install.afterInstall") + "\n";
  hint += border;

  return hint;
}

/**
 * 检查 ImageMagick 是否可用
 */
async function checkImageMagick(magickPath?: string): Promise<boolean> {
  const commands = magickPath ? [magickPath] : ["magick", "convert"];

  for (const cmd of commands) {
    try {
      const checkCmd = createCommand(cmd, {
        args: ["-version"],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await checkCmd.output();
      if (output.success) {
        return true;
      }
    } catch {
      // 命令不存在，继续尝试下一个
      continue;
    }
  }

  return false;
}

/**
 * 检查并尝试安装 ImageMagick
 */
async function ensureImageMagick(
  magickPath?: string,
  autoInstall: boolean = true,
  lang?: Locale,
): Promise<string> {
  if (lang !== undefined) {
    setImageLocale(lang);
  }

  const isAvailable = await checkImageMagick(magickPath);
  if (isAvailable) {
    return await getMagickCommand(magickPath);
  }

  if (autoInstall) {
    console.log("🔍", $tr("log.notFoundTryingInstall"));
    const installed = await tryAutoInstall();

    if (installed) {
      const isNowAvailable = await checkImageMagick(magickPath);
      if (isNowAvailable) {
        return await getMagickCommand(magickPath);
      }
    }
  }

  const hint = await getInstallHint();
  throw new Error($tr("error.notFound", { hint }));
}

/**
 * 获取 ImageMagick 命令路径
 */
async function getMagickCommand(magickPath?: string): Promise<string> {
  const commands = magickPath ? [magickPath] : ["magick", "convert"];

  for (const cmd of commands) {
    try {
      const checkCmd = createCommand(cmd, {
        args: ["-version"],
        stdout: "piped",
        stderr: "piped",
      });

      const output = await checkCmd.output();
      if (output.success) {
        return cmd;
      }
    } catch {
      continue;
    }
  }

  const hint = await getInstallHint();
  throw new Error($tr("error.notFound", { hint }));
}

/**
 * 创建临时文件
 */
async function createTempFile(
  data: Uint8Array,
  extension: string,
  tempDir?: string,
): Promise<string> {
  const dir = tempDir || await makeTempDir();
  const tempFile = `${dir}/temp_${Date.now()}_${
    Math.random().toString(36).substring(7)
  }.${extension}`;
  await writeFile(tempFile, data);
  return tempFile;
}

/**
 * ImageMagick 在输入为多帧（如动画 GIF）且输出为单帧格式时，
 * 会写成 name-0.ext、name-1.ext，而不是期望的 name.ext。
 */
function magickFramePath(outputFile: string, index: number): string {
  const lastDot = outputFile.lastIndexOf(".");
  if (lastDot <= 0) return `${outputFile}-${index}`;
  return `${outputFile.slice(0, lastDot)}-${index}${outputFile.slice(lastDot)}`;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** 删除期望输出文件及 ImageMagick 拆出的各帧文件 */
async function cleanupMagickOutputs(outputFile: string): Promise<void> {
  try {
    await remove(outputFile);
  } catch {
    // 忽略删除错误
  }
  for (let i = 0; i < 1000; i++) {
    const frame = magickFramePath(outputFile, i);
    if (!(await pathExists(frame))) break;
    try {
      await remove(frame);
    } catch {
      break;
    }
  }
}

/**
 * 读取临时文件并删除
 *
 * 若期望路径不存在，则回退读取 ImageMagick 多帧输出的第一帧（name-0.ext）。
 */
async function readAndCleanup(tempFile: string): Promise<Uint8Array> {
  let target = tempFile;
  if (!(await pathExists(tempFile))) {
    const frame0 = magickFramePath(tempFile, 0);
    if (await pathExists(frame0)) {
      target = frame0;
    }
  }
  try {
    const data = await readFile(target);
    await cleanupMagickOutputs(tempFile);
    return data;
  } catch (error) {
    await cleanupMagickOutputs(tempFile);
    throw error;
  }
}

/**
 * 获取文件路径或创建临时文件
 */
async function getInputFile(
  image: Uint8Array | string,
  tempDir?: string,
): Promise<{ file: string; isTemp: boolean }> {
  if (typeof image === "string") {
    return { file: image, isTemp: false };
  }

  const format = detectFormatFromData(image);
  const tempFile = await createTempFile(image, format, tempDir);
  return { file: tempFile, isTemp: true };
}

/**
 * 从数据检测图片格式
 */
function detectFormatFromData(data: Uint8Array): string {
  const header = data.slice(0, 4);
  if (header[0] === 0xFF && header[1] === 0xD8) return "jpg";
  if (header[0] === 0x89 && header[1] === 0x50) return "png";
  if (header[0] === 0x47 && header[1] === 0x49) return "gif";
  if (header[0] === 0x52 && header[1] === 0x49) return "webp";
  return "png";
}

/**
 * 获取 MIME 类型
 */
function getMimeType(format: string): string {
  const mimeMap: Record<string, string> = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    avif: "image/avif",
  };
  return mimeMap[format.toLowerCase()] || "image/png";
}

/**
 * ImageMagick 图片处理器
 */
class ImageMagickProcessor implements ImageProcessor {
  private magickCommand: string;
  private tempDir?: string;

  constructor(magickCommand: string, tempDir?: string) {
    this.magickCommand = magickCommand;
    this.tempDir = tempDir;
  }

  /**
   * 缩放图片
   */
  async resize(
    image: Uint8Array | string,
    options: ResizeOptions,
  ): Promise<Uint8Array> {
    const { file: inputFile, isTemp: inputIsTemp } = await getInputFile(
      image,
      this.tempDir,
    );
    const outputFile = `${inputFile}.resized.png`;

    try {
      // ImageMagick 命令格式：magick input.jpg [操作参数] output.jpg
      // 输入文件必须在操作参数之前
      const args: string[] = [inputFile];

      // 根据 fit 模式设置参数
      if (options.fit === "cover") {
        args.push("-resize", `${options.width || ""}x${options.height || ""}^`);
        args.push("-gravity", "center");
        args.push("-extent", `${options.width || ""}x${options.height || ""}`);
      } else if (options.fit === "contain") {
        args.push("-resize", `${options.width || ""}x${options.height || ""}`);
      } else {
        args.push("-resize", `${options.width || ""}x${options.height || ""}!`);
      }

      if (options.quality) {
        args.push("-quality", String(options.quality));
      }

      args.push(outputFile);

      const cmd = createCommand(this.magickCommand, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        const error = new TextDecoder().decode(output.stderr);
        throw new Error($tr("error.processFailed", { error }));
      }

      const result = await readAndCleanup(outputFile);
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      return result;
    } catch (error) {
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      throw error;
    }
  }

  /**
   * 裁剪图片
   */
  async crop(
    image: Uint8Array | string,
    options: CropOptions,
  ): Promise<Uint8Array> {
    const { file: inputFile, isTemp: inputIsTemp } = await getInputFile(
      image,
      this.tempDir,
    );
    const outputFile = `${inputFile}.cropped.png`;

    try {
      const args = [
        inputFile,
        "-crop",
        `${options.width}x${options.height}+${options.x}+${options.y}`,
        "+repage",
        outputFile,
      ];

      const cmd = createCommand(this.magickCommand, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        const error = new TextDecoder().decode(output.stderr);
        throw new Error($tr("error.processFailed", { error }));
      }

      const result = await readAndCleanup(outputFile);
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      return result;
    } catch (error) {
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      throw error;
    }
  }

  /**
   * 格式转换
   */
  async convert(
    image: Uint8Array | string,
    options: ConvertOptions,
  ): Promise<Uint8Array> {
    const { file: inputFile, isTemp: inputIsTemp } = await getInputFile(
      image,
      this.tempDir,
    );
    // 根据格式确定文件扩展名
    const ext = options.format === "jpeg" ? "jpg" : options.format;
    const outputFile = `${inputFile}.converted.${ext}`;

    try {
      const args: string[] = [inputFile];

      // 输出格式由 outputFile 扩展名决定，不单独传 -format
      // 根据格式和质量设置压缩参数
      if (options.quality !== undefined) {
        if (options.format === "png") {
          // PNG 压缩：quality 0-100，100 表示无损
          // ImageMagick 使用 -quality 参数，但 PNG 压缩更依赖优化级别
          args.push("-quality", String(options.quality));
          // PNG 无损压缩优化
          if (options.quality === 100) {
            args.push("-define", "png:compression-level=9");
          }
        } else if (options.format === "gif") {
          // GIF 压缩：quality 控制颜色数量优化
          args.push("-quality", String(options.quality));
        } else {
          // JPEG、WebP、AVIF 等格式使用标准 quality 参数
          args.push("-quality", String(options.quality));
        }
      }

      args.push(outputFile);

      const cmd = createCommand(this.magickCommand, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        const error = new TextDecoder().decode(output.stderr);
        throw new Error($tr("error.processFailed", { error }));
      }

      const result = await readAndCleanup(outputFile);
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      return result;
    } catch (error) {
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      throw error;
    }
  }

  /**
   * 压缩图片
   *
   * 支持所有常见格式的压缩，有损/无损压缩通过 quality 参数控制。
   * - quality = 100：无损压缩（保持原始质量）
   * - quality < 100：有损压缩（文件更小，质量降低）
   * - quality 未指定：根据格式自动判断（PNG/GIF 默认 100，其他默认 80）
   */
  async compress(
    image: Uint8Array | string,
    options: CompressOptions,
  ): Promise<Uint8Array> {
    const format = options.format || "jpeg";

    // 根据格式自动判断默认质量
    let quality = options.quality;
    if (quality === undefined) {
      if (format === "png" || format === "gif") {
        quality = 100; // PNG/GIF 默认无损
      } else {
        quality = 80; // 其他格式默认有损
      }
    }

    return await this.convert(image, { format, quality });
  }

  /**
   * 添加水印
   */
  async addWatermark(
    image: Uint8Array | string,
    options: WatermarkOptions,
  ): Promise<Uint8Array> {
    const { file: inputFile, isTemp: inputIsTemp } = await getInputFile(
      image,
      this.tempDir,
    );
    const outputFile = `${inputFile}.watermarked.png`;

    try {
      const args: string[] = [inputFile];

      if (options.type === "text" && options.text) {
        // 文字水印
        const fontSize = options.fontSize || 24;
        const color = options.color || "#FFFFFF";
        // 注意：ImageMagick 文字水印的透明度需要通过颜色 RGBA 设置，这里暂时不支持透明度

        // 计算位置
        let gravity = "SouthEast";
        if (options.position === "top-left") gravity = "NorthWest";
        else if (options.position === "top-right") gravity = "NorthEast";
        else if (options.position === "bottom-left") gravity = "SouthWest";
        else if (options.position === "bottom-right") gravity = "SouthEast";
        else if (options.position === "center") gravity = "Center";

        args.push(
          "-font",
          "Arial",
          "-pointsize",
          String(fontSize),
          "-fill",
          color,
          "-gravity",
          gravity,
          "-annotate",
          "+10+10",
          options.text,
        );
      } else if (options.type === "image" && options.image) {
        // 图片水印
        const watermarkFile = typeof options.image === "string"
          ? options.image
          : (await createTempFile(options.image, "png", this.tempDir));
        const watermarkIsTemp = typeof options.image !== "string";

        try {
          const opacity = options.opacity || 1;
          let gravity = "SouthEast";
          if (options.position === "top-left") gravity = "NorthWest";
          else if (options.position === "top-right") gravity = "NorthEast";
          else if (options.position === "bottom-left") gravity = "SouthWest";
          else if (options.position === "bottom-right") gravity = "SouthEast";
          else if (options.position === "center") gravity = "Center";

          // 设置透明度
          if (opacity < 1) {
            args.push(
              "(",
              watermarkFile,
              "-alpha",
              "set",
              "-channel",
              "A",
              "-evaluate",
              "multiply",
              String(opacity),
              ")",
            );
          } else {
            args.push(watermarkFile);
          }

          args.push(
            "-gravity",
            gravity,
            "-geometry",
            "+10+10",
            "-composite",
          );
        } finally {
          if (watermarkIsTemp) {
            try {
              await remove(watermarkFile);
            } catch {
              // 忽略删除错误
            }
          }
        }
      }

      args.push(outputFile);

      const cmd = createCommand(this.magickCommand, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        const error = new TextDecoder().decode(output.stderr);
        throw new Error($tr("error.processFailed", { error }));
      }

      const result = await readAndCleanup(outputFile);
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      return result;
    } catch (error) {
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
      throw error;
    }
  }

  /**
   * 提取图片信息
   */
  async extractInfo(image: Uint8Array | string): Promise<ImageInfo> {
    const { file: inputFile, isTemp: inputIsTemp } = await getInputFile(
      image,
      this.tempDir,
    );

    try {
      const args = [
        inputFile,
        "-format",
        "%w|%h|%m|%b",
        "info:",
      ];

      const cmd = createCommand(this.magickCommand, {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      const output = await cmd.output();
      if (!output.success) {
        const error = new TextDecoder().decode(output.stderr);
        throw new Error($tr("error.processFailed", { error }));
      }

      const info = new TextDecoder().decode(output.stdout).trim();
      const [width, height, format] = info.split("|");

      const formatLower = format.toLowerCase();
      const size = typeof image === "string"
        ? (await stat(inputFile)).size
        : image.length;

      return {
        width: parseInt(width, 10) || 0,
        height: parseInt(height, 10) || 0,
        format: formatLower,
        mimeType: getMimeType(formatLower),
        size,
      };
    } finally {
      if (inputIsTemp) {
        try {
          await remove(inputFile);
        } catch {
          // 忽略删除错误
        }
      }
    }
  }
}

/**
 * 创建图片处理器
 *
 * 使用 ImageMagick 命令行工具进行图片处理。
 * 如果未安装 ImageMagick，会尝试自动安装（如果启用），否则会抛出错误并提示安装方法。
 *
 * @param options 处理器配置
 * @returns 图片处理器实例
 */
export async function createImageProcessor(
  options: ImageProcessorOptions = {},
): Promise<ImageProcessor> {
  const autoInstall = options.autoInstall !== false; // 默认启用自动安装

  // 检查并确保 ImageMagick 可用（如果未安装会尝试自动安装）
  const magickCommand = await ensureImageMagick(
    options.magickPath,
    autoInstall,
    options.lang,
  );

  return new ImageMagickProcessor(magickCommand, options.tempDir);
}

// 导出便捷函数（同步创建处理器，首次调用时检查）
let defaultProcessor: ImageProcessor | null = null;

async function getDefaultProcessor(): Promise<ImageProcessor> {
  if (!defaultProcessor) {
    defaultProcessor = await createImageProcessor();
  }
  return defaultProcessor;
}

export const resize = async (
  image: Uint8Array | string,
  options: ResizeOptions,
): Promise<Uint8Array> => {
  const processor = await getDefaultProcessor();
  return processor.resize(image, options);
};

export const crop = async (
  image: Uint8Array | string,
  options: CropOptions,
): Promise<Uint8Array> => {
  const processor = await getDefaultProcessor();
  return processor.crop(image, options);
};

export const convert = async (
  image: Uint8Array | string,
  options: ConvertOptions,
): Promise<Uint8Array> => {
  const processor = await getDefaultProcessor();
  return processor.convert(image, options);
};

export const compress = async (
  image: Uint8Array | string,
  options: CompressOptions,
): Promise<Uint8Array> => {
  const processor = await getDefaultProcessor();
  return processor.compress(image, options);
};

export const addWatermark = async (
  image: Uint8Array | string,
  options: WatermarkOptions,
): Promise<Uint8Array> => {
  const processor = await getDefaultProcessor();
  return processor.addWatermark(image, options);
};

export const extractInfo = async (
  image: Uint8Array | string,
): Promise<ImageInfo> => {
  const processor = await getDefaultProcessor();
  return processor.extractInfo(image);
};
