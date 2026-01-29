# @dreamer/image/client

> 一个用于浏览器的图片处理库，提供图片处理、图片转换、图片压缩等功能

[![JSR](https://jsr.io/badges/@dreamer/image/client)](https://jsr.io/@dreamer/image/client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)

---

使用浏览器原生 Canvas API 和 Image API 实现图片处理功能，无需额外依赖。

## 功能

客户端图片处理库，提供与服务端一致的 API，使用浏览器原生能力实现。

## 特性

- **图片缩放**：
  - 等比例缩放（保持宽高比）
  - 指定尺寸缩放（宽度、高度）
  - 多种缩放模式（contain、cover、fill 等）
- **图片裁剪**：
  - 矩形裁剪
  - 精确坐标控制（x、y、width、height）
- **格式转换**：
  - 支持常见格式（JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF）
  - 格式自动检测
- **图片压缩**：
  - 有损压缩
  - 质量控制（0-1 范围）
- **水印添加**：
  - 文字水印
  - 图片水印
  - 位置和透明度控制
- **信息提取**：
  - 图片尺寸（宽度、高度）
  - 图片格式（MIME 类型）
  - 文件大小

## 安装

```bash
deno add jsr:@dreamer/image
```

## 导入

```typescript
import {
  resize,
  crop,
  convert,
  compress,
  addWatermark,
  extractInfo,
} from "jsr:@dreamer/image/client";
```

## 环境兼容性

- **浏览器**：✅ 支持所有现代浏览器
- **依赖**：无需额外依赖，使用浏览器原生 API
- **API 要求**：Canvas API、Image API、Blob API

## 🚀 快速开始

### 基本使用

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
  fit: "contain",
  quality: 0.9, // 客户端使用 0-1 范围
});

// 图片裁剪
const croppedBlob = await crop(arrayBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});

// 格式转换
const convertedBlob = await convert(arrayBuffer, {
  format: "webp",
  quality: 0.85,
});

// 图片压缩
const compressedBlob = await compress(arrayBuffer, {
  quality: 0.8,
  format: "jpeg",
});

// 添加文字水印
const watermarkedBlob = await addWatermark(arrayBuffer, {
  type: "text",
  text: "© 2024",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

// 添加图片水印
const watermarkImage = await fileInput.files?.[1]?.arrayBuffer();
if (watermarkImage) {
  const watermarkedImageBlob = await addWatermark(arrayBuffer, {
    type: "image",
    image: watermarkImage,
    position: "top-right",
    opacity: 0.7,
  });
}

// 提取图片信息
const info = await extractInfo(arrayBuffer);
console.log(info);
// {
//   width: 1920,
//   height: 1080,
//   format: "jpeg",
//   mimeType: "image/jpeg",
//   size: 245678,
// }

// 创建预览 URL
const previewUrl = URL.createObjectURL(resizedBlob);
const img = document.createElement("img");
img.src = previewUrl;
document.body.appendChild(img);
```

### 文件上传处理

```typescript
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // 读取文件
  const arrayBuffer = await file.arrayBuffer();

  // 压缩图片
  const compressed = await compress(arrayBuffer, {
    quality: 0.8,
    format: "jpeg",
  });

  // 上传到服务器
  const formData = new FormData();
  formData.append("image", compressed, "compressed.jpg");

  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
}
```

### 图片预览和编辑

```typescript
async function setupImageEditor(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const info = await extractInfo(arrayBuffer);

  // 显示原始图片信息
  console.log(`原始尺寸: ${info.width}x${info.height}`);
  console.log(`格式: ${info.format}`);
  console.log(`大小: ${(info.size / 1024).toFixed(2)} KB`);

  // 生成缩略图
  const thumbnail = await resize(arrayBuffer, {
    width: 200,
    height: 200,
    fit: "cover",
    quality: 0.9,
  });

  // 显示缩略图
  const thumbnailUrl = URL.createObjectURL(thumbnail);
  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = thumbnailUrl;
  document.body.appendChild(thumbnailImg);
}
```

## API 文档

### `resize(image, options)`

缩放图片。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL
- `options`: `ResizeOptions` - 缩放选项

**返回**：`Promise<Blob>` - 处理后的图片 Blob

**示例**：
```typescript
const blob = await resize(arrayBuffer, {
  width: 800,
  height: 600,
  fit: "contain", // "contain" | "cover" | "fill"
  quality: 0.9, // 0-1
});
```

### `crop(image, options)`

裁剪图片。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL
- `options`: `CropOptions` - 裁剪选项

**返回**：`Promise<Blob>` - 处理后的图片 Blob

**示例**：
```typescript
const blob = await crop(arrayBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});
```

### `convert(image, options)`

格式转换。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL
- `options`: `ConvertOptions` - 转换选项

**返回**：`Promise<Blob>` - 处理后的图片 Blob

**示例**：
```typescript
const blob = await convert(arrayBuffer, {
  format: "webp",
  quality: 0.85, // 0-1
});
```

### `compress(image, options)`

压缩图片。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL
- `options`: `CompressOptions` - 压缩选项

**返回**：`Promise<Blob>` - 处理后的图片 Blob

**示例**：
```typescript
const blob = await compress(arrayBuffer, {
  quality: 0.8, // 0-1
  format: "jpeg",
});
```

### `addWatermark(image, options)`

添加水印。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL
- `options`: `WatermarkOptions` - 水印选项

**返回**：`Promise<Blob>` - 处理后的图片 Blob

**示例**：
```typescript
// 文字水印
const blob = await addWatermark(arrayBuffer, {
  type: "text",
  text: "© 2024",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

// 图片水印
const blob = await addWatermark(arrayBuffer, {
  type: "image",
  image: watermarkArrayBuffer,
  position: "top-right",
  opacity: 0.7,
});
```

### `extractInfo(image)`

提取图片信息。

**参数**：
- `image`: `ArrayBuffer | Uint8Array | string` - 图片数据或 Data URL

**返回**：`Promise<ImageInfo>` - 图片信息

**示例**：
```typescript
const info = await extractInfo(arrayBuffer);
// {
//   width: 1920,
//   height: 1080,
//   format: "jpeg",
//   mimeType: "image/jpeg",
//   size: 245678,
// }
```

## 类型定义

```typescript
// 缩放选项
interface ResizeOptions {
  width?: number; // 目标宽度（像素）
  height?: number; // 目标高度（像素）
  fit?: "contain" | "cover" | "fill"; // 缩放模式
  quality?: number; // 质量（0-1）
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
  quality?: number; // 质量（0-1）
}

// 压缩选项
interface CompressOptions {
  quality?: number; // 质量（0-1）
  format?: "jpeg" | "webp"; // 格式
}

// 水印选项
interface WatermarkOptions {
  type: "text" | "image"; // 水印类型
  text?: string; // 文字内容（当 type 为 "text" 时）
  image?: ArrayBuffer | Uint8Array | string; // 图片数据（当 type 为 "image" 时）
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

## 性能优化

- **Canvas API**：使用浏览器原生 Canvas API，性能优秀
- **内存管理**：自动管理内存，处理完成后释放资源
- **文件大小**：建议限制处理的文件大小（如 10MB 以内）
- **批量处理**：可以并发处理多个图片

## 注意事项

- **文件大小**：处理大文件时可能影响性能，建议限制文件大小
- **浏览器兼容性**：需要支持 Canvas API 的现代浏览器
- **格式支持**：不同浏览器的格式支持可能不同
- **内存占用**：处理大图片时注意内存占用
- **Blob URL**：使用 `URL.createObjectURL()` 创建的 URL 需要手动释放（`URL.revokeObjectURL()`）

## 与服务端的区别

- **返回类型**：客户端返回 `Blob`，服务端返回 `Uint8Array`
- **质量参数**：客户端使用 0-1 范围，服务端使用 0-100 范围
- **输入类型**：客户端支持 `ArrayBuffer`、`Uint8Array` 或 `string`（Data URL）
- **依赖**：客户端无需外部依赖，服务端需要 ImageMagick

---

## 📝 备注

- **统一接口**：与服务端使用相似的 API 接口，降低学习成本
- **浏览器兼容性**：需要支持 Canvas API 的现代浏览器
- **类型安全**：完整的 TypeScript 类型支持
- **无外部依赖**：纯 TypeScript 实现

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE.md](../../../LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
