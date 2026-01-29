# @dreamer/image

> 一个兼容 Deno 和 Bun 的图片处理库，提供图片处理、图片转换、图片压缩等功能

[![JSR](https://jsr.io/badges/@dreamer/image)](https://jsr.io/@dreamer/image)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)

---

## 🎯 功能

图片处理库，用于图片处理、图片转换、图片压缩等场景，支持服务端和客户端。

## 特性

- **图片缩放**：
  - 等比例缩放（保持宽高比）
  - 指定尺寸缩放（宽度、高度）
  - 多种缩放模式（contain、cover、fill、inside、outside）
  - 质量控制（0-100）
  - 支持批量缩放
- **图片裁剪**：
  - 矩形裁剪（指定位置和尺寸）
  - 精确坐标控制（x、y、width、height）
  - 支持自定义裁剪区域
- **格式转换**：
  - 支持常见格式（JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF）
  - 格式自动检测
  - 质量控制（0-100）
  - 批量格式转换
- **图片压缩**：
  - 支持所有常见格式（JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF）
  - **有损/无损压缩**：通过 `quality` 参数控制
    - `quality = 100`：无损压缩（保持原始质量）
    - `quality < 100`：有损压缩（文件更小，质量降低）
  - 压缩质量控制（0-100，数值越低文件越小但质量越低）
  - 文件大小优化
  - 格式自动适配（PNG/GIF 默认 quality=100，JPEG/WebP/AVIF 默认 quality=80）
- **水印添加**：
  - 文字水印（自定义字体、颜色、位置、大小）
  - 图片水印（Logo、图标）
  - 透明度控制（0-1）
  - 位置控制（左上、右上、左下、右下、居中）
  - 支持多水印叠加
- **图片信息提取**：
  - 尺寸信息（宽度、高度）
  - 格式信息（MIME 类型）
  - 文件大小
  - EXIF 数据（如果可用）

## 使用场景

- 图片上传和处理（头像上传、图片上传）
- 图片缩略图生成（相册、图片列表）
- 图片格式转换（WebP 转换、格式统一）
- 图片压缩优化（减少文件大小、提升加载速度）
- 水印添加（版权保护、品牌标识）
- 图片信息提取（元数据、尺寸信息）

## 安装

```bash
deno add jsr:@dreamer/image
```

## 环境兼容性

- **运行时要求**：Deno 2.6+ 或 Bun 1.3.5
- **服务端**：✅ 支持（兼容 Deno 和 Bun 运行时，使用 ImageMagick）
  - 使用 ImageMagick 命令行工具
  - 支持所有图片处理功能
  - 自动检测和安装 ImageMagick（macOS）
  - 需要文件系统访问权限
- **客户端**：✅ 支持（浏览器环境，使用 Canvas API）
  - 使用浏览器原生 API（Canvas、Image）
  - 支持大部分图片处理功能（缩放、裁剪、格式转换、压缩、水印）
  - 详见 [客户端文档](./src/client/README.md)

## 服务端使用

### 前置要求

服务端需要安装 ImageMagick。库会自动检测并尝试安装（macOS），如果无法自动安装会显示安装提示。

**macOS**：
```bash
brew install imagemagick
```

**Linux (Ubuntu/Debian)**：
```bash
sudo apt-get install -y imagemagick
```

**Linux (CentOS/RHEL)**：
```bash
sudo yum install -y ImageMagick
```

**Windows**：
访问 [ImageMagick 官网](https://imagemagick.org/script/download.php) 下载并安装。

### 基本使用

```typescript
import {
  resize,
  crop,
  convert,
  compress,
  addWatermark,
  extractInfo,
  createImageProcessor,
} from "jsr:@dreamer/image";

// 方式1：使用便捷函数（推荐）
// 库会自动检测并安装 ImageMagick（如果未安装）

// 从文件读取图片
// 使用 runtime-adapter 的 readFile（自动适配 Deno 和 Bun）
import { readFile } from "@dreamer/runtime-adapter";
const imageBuffer = await readFile("./input.jpg");

// 图片缩放
const resized = await resize(imageBuffer, {
  width: 800,
  height: 600,
  fit: "contain", // 或 "cover"、"fill"、"inside"、"outside"
  quality: 90,
});

// 图片裁剪
const cropped = await crop(imageBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});

// 格式转换
const converted = await convert(imageBuffer, {
  format: "webp",
  quality: 85,
});

// 图片压缩（有损压缩）
const compressed = await compress(imageBuffer, {
  quality: 80, // 质量 0-100，数值越低文件越小
  format: "webp", // 支持所有格式：jpeg、png、webp、gif、bmp、tiff、avif
});

// 无损压缩（保持原始质量）
const lossless = await compress(imageBuffer, {
  quality: 100, // quality = 100 表示无损压缩
  format: "png",
});

// 有损压缩
const lossy = await compress(imageBuffer, {
  quality: 75, // quality < 100 表示有损压缩
  format: "jpeg",
});

// 压缩为 AVIF 格式（现代浏览器支持，压缩率更高）
const avif = await compress(imageBuffer, {
  quality: 75,
  format: "avif", // AVIF 格式压缩率比 WebP 更高
});

// 添加文字水印
const watermarked = await addWatermark(imageBuffer, {
  type: "text",
  text: "© 2024 My Company",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

// 添加图片水印
const watermarkedImage = await addWatermark(imageBuffer, {
  type: "image",
  image: await readFile("./logo.png"),
  position: "top-right",
  opacity: 0.7,
});

// 提取图片信息
const info = await extractInfo(imageBuffer);
console.log(info);
// {
//   width: 1920,
//   height: 1080,
//   format: "jpeg",
//   mimeType: "image/jpeg",
//   size: 245678,
// }

// 保存处理后的图片
// 使用 runtime-adapter 的 writeFile（自动适配 Deno 和 Bun）
import { writeFile } from "@dreamer/runtime-adapter";
await writeFile("./output.jpg", resized);
```

### 高级配置

```typescript
import { createImageProcessor } from "jsr:@dreamer/image";

// 方式2：创建处理器实例（支持自定义配置）
const processor = await createImageProcessor({
  // ImageMagick 命令路径（可选，默认自动检测）
  magickPath: "/usr/local/bin/magick",

  // 临时文件目录（可选，默认系统临时目录）
  tempDir: "./temp",

  // 是否自动安装 ImageMagick（默认：true）
  autoInstall: true,
});

// 使用处理器
const resized = await processor.resize(imageBuffer, {
  width: 800,
  height: 600,
});
```

### 使用文件路径

```typescript
// 也可以直接使用文件路径
const resized = await resize("./input.jpg", {
  width: 800,
  height: 600,
});

// 保存到文件
// 使用 runtime-adapter 的 writeFile（自动适配 Deno 和 Bun）
import { writeFile } from "@dreamer/runtime-adapter";
await writeFile("./output.jpg", resized);
```

## 客户端使用

客户端使用浏览器原生 Canvas API，无需额外依赖。详见 [客户端文档](./src/client/README.md)。

```typescript
import {
  resize,
  crop,
  convert,
  compress,
  addWatermark,
  extractInfo,
} from "jsr:@dreamer/image/client";

// 从文件输入读取图片
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput.files?.[0];
if (!file) return;

// 读取为 ArrayBuffer
const arrayBuffer = await file.arrayBuffer();

// 图片缩放（返回 Blob）
const resizedBlob = await resize(arrayBuffer, {
  width: 800,
  height: 600,
  quality: 0.9, // 客户端使用 0-1 范围
});

// 创建预览 URL
const previewUrl = URL.createObjectURL(resizedBlob);
const img = document.createElement("img");
img.src = previewUrl;
document.body.appendChild(img);
```

## API 文档

### 核心函数

#### `resize(image, options)`

缩放图片。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径
- `options`: `ResizeOptions` - 缩放选项

**返回**：`Promise<Uint8Array>` - 处理后的图片数据

**示例**：
```typescript
const resized = await resize(imageBuffer, {
  width: 800,
  height: 600,
  fit: "contain", // "contain" | "cover" | "fill" | "inside" | "outside"
  quality: 90, // 0-100
});
```

#### `crop(image, options)`

裁剪图片。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径
- `options`: `CropOptions` - 裁剪选项

**返回**：`Promise<Uint8Array>` - 处理后的图片数据

**示例**：
```typescript
const cropped = await crop(imageBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});
```

#### `convert(image, options)`

格式转换。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径
- `options`: `ConvertOptions` - 转换选项

**返回**：`Promise<Uint8Array>` - 处理后的图片数据

**示例**：
```typescript
const converted = await convert(imageBuffer, {
  format: "webp",
  quality: 85,
});
```

#### `compress(image, options)`

压缩图片。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径
- `options`: `CompressOptions` - 压缩选项
  - `quality`: `number` - 质量（0-100，可选）
    - `100`：无损压缩（保持原始质量）
    - `< 100`：有损压缩（文件更小，质量降低）
    - 未指定时：根据格式自动判断（PNG/GIF 默认 100，其他默认 80）
  - `format`: `"jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif"` - 目标格式（可选，默认：jpeg）

**返回**：`Promise<Uint8Array>` - 压缩后的图片数据

**压缩模式说明**：
- **有损压缩**：通过降低质量来减小文件大小
  - 适用于：JPEG、WebP、AVIF 等格式
  - 设置：`quality < 100`
- **无损压缩**：保持原始质量，但文件较大
  - 适用于：PNG、GIF 等格式
  - 设置：`quality = 100`

**格式选择建议**：
- **Web 应用**：推荐 WebP 或 AVIF（压缩率高，质量好）
- **兼容性要求高**：使用 JPEG
- **需要透明通道**：使用 PNG（无损）
- **动画图片**：使用 GIF

**示例**：
```typescript
// 有损压缩为 WebP（推荐用于 Web）
const compressed = await compress(imageBuffer, {
  quality: 80,
  format: "webp",
});

// 无损压缩为 PNG
const lossless = await compress(imageBuffer, {
  quality: 100, // quality = 100 表示无损压缩
  format: "png",
});

// 压缩为 AVIF（最高压缩率）
const avif = await compress(imageBuffer, {
  quality: 75, // quality < 100 表示有损压缩
  format: "avif",
});

// 有损压缩为 JPEG
const lossy = await compress(imageBuffer, {
  quality: 60, // quality < 100 表示有损压缩
  format: "jpeg",
});
```

#### `addWatermark(image, options)`

添加水印。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径
- `options`: `WatermarkOptions` - 水印选项

**返回**：`Promise<Uint8Array>` - 处理后的图片数据

**示例**：
```typescript
// 文字水印
const watermarked = await addWatermark(imageBuffer, {
  type: "text",
  text: "© 2024",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

// 图片水印
const watermarkedImage = await addWatermark(imageBuffer, {
  type: "image",
  image: await readFile("./logo.png"),
  position: "top-right",
  opacity: 0.7,
});
```

#### `extractInfo(image)`

提取图片信息。

**参数**：
- `image`: `Uint8Array | string` - 图片数据或文件路径

**返回**：`Promise<ImageInfo>` - 图片信息

**示例**：
```typescript
const info = await extractInfo(imageBuffer);
// {
//   width: 1920,
//   height: 1080,
//   format: "jpeg",
//   mimeType: "image/jpeg",
//   size: 245678,
// }
```

### 类型定义

```typescript
// 缩放选项
interface ResizeOptions {
  width?: number; // 目标宽度（像素）
  height?: number; // 目标高度（像素）
  fit?: "contain" | "cover" | "fill" | "inside" | "outside"; // 缩放模式
  quality?: number; // 质量（0-100）
}

// 裁剪选项
interface CropOptions {
  x: number; // 裁剪起始 X 坐标
  y: number; // 裁剪起始 Y 坐标
  width: number; // 裁剪宽度
  height: number; // 裁剪高度
}

// 格式转换选项
interface ConvertOptions {
  format: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif"; // 目标格式
  quality?: number; // 质量（0-100）
}

// 压缩选项
interface CompressOptions {
  quality?: number; // 质量（0-100，可选）
  // - 100：无损压缩（保持原始质量）
  // - < 100：有损压缩（文件更小，质量降低）
  // - 未指定：根据格式自动判断（PNG/GIF 默认 100，其他默认 80）
  format?: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif"; // 目标格式（可选，默认：jpeg）
}

// 水印选项
interface WatermarkOptions {
  type: "text" | "image"; // 水印类型
  text?: string; // 文字内容（当 type 为 "text" 时）
  image?: Uint8Array | string; // 图片数据（当 type 为 "image" 时）
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"; // 位置
  fontSize?: number; // 字体大小（当 type 为 "text" 时）
  color?: string; // 文字颜色（当 type 为 "text" 时）
  opacity?: number; // 透明度（0-1）
}

// 图片信息
interface ImageInfo {
  width: number; // 宽度（像素）
  height: number; // 高度（像素）
  format: string; // 格式
  mimeType: string; // MIME 类型
  size: number; // 文件大小（字节）
}
```

## 支持的图片格式

- **输入格式**：JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF
- **输出格式**：JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF

### 压缩模式说明

**有损压缩**（通过降低质量来减小文件大小）：
- 设置方式：`quality < 100`
- 适用格式：JPEG、WebP、AVIF 等
- 特点：文件更小，但质量会降低
- 推荐：WebP 或 AVIF 用于 Web 应用（压缩率高，质量好）

**无损压缩**（保持原始质量，文件较大）：
- 设置方式：`quality = 100`
- 适用格式：PNG、GIF 等
- 特点：保持原始质量，但文件较大
- 推荐：PNG 用于需要透明通道的场景（图标、Logo）

**格式选择建议**：
- **Web 应用**：推荐 WebP 或 AVIF（压缩率高，质量好）
- **兼容性要求高**：使用 JPEG
- **需要透明通道**：使用 PNG（无损）
- **动画图片**：使用 GIF

**注意**：有损/无损压缩是通过 `quality` 参数控制的，而不是格式本身决定的。所有格式都支持有损和无损压缩。

## 自动安装 ImageMagick

库会自动检测 ImageMagick 是否已安装：

- **macOS**：如果检测到 Homebrew，会自动尝试安装 ImageMagick
- **Linux/Windows**：显示详细的安装提示和命令

如果自动安装失败或无法自动安装，会显示清晰的安装提示，包括：
- 操作系统特定的安装命令
- 安装步骤说明
- 下载链接（Windows）

## 性能优化

- **服务端**：使用 ImageMagick 命令行工具，性能优秀
- **客户端**：使用 Canvas API，适合中小型图片处理
- **临时文件**：自动管理临时文件，处理完成后自动清理
- **内存优化**：支持大文件处理，自动管理内存

## 注意事项

- **服务端**：需要安装 ImageMagick，库会自动检测并尝试安装
- **客户端**：使用浏览器原生 API，无需额外依赖
- **文件大小**：客户端处理大文件时可能影响性能，建议限制文件大小
- **格式支持**：不同格式的功能支持可能不同
- **内存占用**：处理大图片时注意内存占用
- **临时文件**：服务端会自动创建和清理临时文件

## 更多信息

- [客户端文档](./src/client/README.md) - 客户端使用说明
- [ImageMagick 官网](https://imagemagick.org/) - ImageMagick 官方文档

---

## 📝 备注

- **服务端和客户端分离**：通过 `/client` 子路径明确区分服务端和客户端代码
- **统一接口**：服务端和客户端使用相同的 API 接口，降低学习成本
- **类型安全**：完整的 TypeScript 类型支持
- **依赖**：服务端需要 ImageMagick（可选），客户端使用浏览器原生 API

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
