/**
 * @module @dreamer/image/client
 *
 * @fileoverview 图片处理库 - 客户端实现
 *
 * 使用浏览器原生 Canvas API 和 Image API 实现图片处理功能。
 */

/// <reference lib="dom" />


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
  /** 质量（0-1） */
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
  /** 质量（0-1） */
  quality?: number;
}

/**
 * 压缩选项
 */
export interface CompressOptions {
  /** 质量（0-1） */
  quality?: number;
  /** 格式 */
  format?: "jpeg" | "webp";
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
  image?: ArrayBuffer | Uint8Array | string;
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
 * 加载图片数据
 */
function loadImage(
  data: ArrayBuffer | Uint8Array | string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (typeof data === "string") {
      img.src = data;
    } else {
      const arrayBuffer = data instanceof Uint8Array ? data.buffer : data;
      const blob = new Blob([arrayBuffer as BlobPart]);
      img.src = URL.createObjectURL(blob);
    }
  });
}

/**
 * 将 Canvas 转换为 Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = getMimeType(format);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
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
 * 检测图片格式
 */
function detectFormat(data: ArrayBuffer | Uint8Array | string): string {
  if (typeof data === "string") {
    const ext = data.split(".").pop()?.toLowerCase() || "png";
    return ext;
  }

  const arrayBuffer = data instanceof Uint8Array ? data.buffer : data;
  const header = new Uint8Array(arrayBuffer.slice(0, 4));

  if (header[0] === 0xFF && header[1] === 0xD8) return "jpeg";
  if (header[0] === 0x89 && header[1] === 0x50) return "png";
  if (header[0] === 0x47 && header[1] === 0x49) return "gif";
  if (header[0] === 0x52 && header[1] === 0x49) return "webp";

  return "png";
}

/**
 * 图片缩放
 *
 * @param image 图片数据（ArrayBuffer、Uint8Array 或 Data URL）
 * @param options 缩放选项
 * @returns 处理后的图片 Blob
 */
export async function resize(
  image: ArrayBuffer | Uint8Array | string,
  options: ResizeOptions,
): Promise<Blob> {
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  let { width = img.width, height = img.height } = options;
  const { fit = "contain" } = options;

  // 根据 fit 模式计算尺寸
  if (fit === "contain") {
    const ratio = Math.min(width / img.width, height / img.height);
    width = img.width * ratio;
    height = img.height * ratio;
  } else if (fit === "cover") {
    const ratio = Math.max(width / img.width, height / img.height);
    width = img.width * ratio;
    height = img.height * ratio;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  return canvasToBlob(canvas, "png", options.quality);
}

/**
 * 图片裁剪
 *
 * @param image 图片数据
 * @param options 裁剪选项
 * @returns 处理后的图片 Blob
 */
export async function crop(
  image: ArrayBuffer | Uint8Array | string,
  options: CropOptions,
): Promise<Blob> {
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = options.width;
  canvas.height = options.height;

  ctx.drawImage(
    img,
    options.x,
    options.y,
    options.width,
    options.height,
    0,
    0,
    options.width,
    options.height,
  );

  return canvasToBlob(canvas, "png");
}

/**
 * 格式转换
 *
 * @param image 图片数据
 * @param options 转换选项
 * @returns 处理后的图片 Blob
 */
export async function convert(
  image: ArrayBuffer | Uint8Array | string,
  options: ConvertOptions,
): Promise<Blob> {
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  return canvasToBlob(canvas, options.format, options.quality);
}

/**
 * 图片压缩
 *
 * @param image 图片数据
 * @param options 压缩选项
 * @returns 处理后的图片 Blob
 */
export function compress(
  image: ArrayBuffer | Uint8Array | string,
  options: CompressOptions,
): Promise<Blob> {
  const format = options.format || "jpeg";
  return convert(image, { format, quality: options.quality });
}

/**
 * 添加水印
 *
 * @param image 图片数据
 * @param options 水印选项
 * @returns 处理后的图片 Blob
 */
export async function addWatermark(
  image: ArrayBuffer | Uint8Array | string,
  options: WatermarkOptions,
): Promise<Blob> {
  const img = await loadImage(image);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);
  ctx.globalAlpha = options.opacity || 1;

  const position = options.position || "bottom-right";
  let x = 0;
  let y = 0;

  if (options.type === "text" && options.text) {
    ctx.font = `${options.fontSize || 24}px Arial`;
    ctx.fillStyle = options.color || "#FFFFFF";

    const metrics = ctx.measureText(options.text);
    const textWidth = metrics.width;
    const textHeight = options.fontSize || 24;

    // 计算位置
    if (position === "top-left") {
      x = 10;
      y = textHeight + 10;
    } else if (position === "top-right") {
      x = canvas.width - textWidth - 10;
      y = textHeight + 10;
    } else if (position === "bottom-left") {
      x = 10;
      y = canvas.height - 10;
    } else if (position === "bottom-right") {
      x = canvas.width - textWidth - 10;
      y = canvas.height - 10;
    } else if (position === "center") {
      x = (canvas.width - textWidth) / 2;
      y = (canvas.height + textHeight) / 2;
    }

    ctx.fillText(options.text, x, y);
  } else if (options.type === "image" && options.image) {
    const watermarkImg = await loadImage(options.image);

    // 计算位置
    if (position === "top-left") {
      x = 10;
      y = 10;
    } else if (position === "top-right") {
      x = canvas.width - watermarkImg.width - 10;
      y = 10;
    } else if (position === "bottom-left") {
      x = 10;
      y = canvas.height - watermarkImg.height - 10;
    } else if (position === "bottom-right") {
      x = canvas.width - watermarkImg.width - 10;
      y = canvas.height - watermarkImg.height - 10;
    } else if (position === "center") {
      x = (canvas.width - watermarkImg.width) / 2;
      y = (canvas.height - watermarkImg.height) / 2;
    }

    ctx.drawImage(watermarkImg, x, y);
  }

  return canvasToBlob(canvas, "png");
}

/**
 * 提取图片信息
 *
 * @param image 图片数据
 * @returns 图片信息
 */
export async function extractInfo(
  image: ArrayBuffer | Uint8Array | string,
): Promise<ImageInfo> {
  const img = await loadImage(image);
  const format = detectFormat(image);
  const size = typeof image === "string"
    ? 0
    : (image instanceof Uint8Array ? image.length : image.byteLength);

  return {
    width: img.width,
    height: img.height,
    format: format.toLowerCase(),
    mimeType: getMimeType(format),
    size,
  };
}
