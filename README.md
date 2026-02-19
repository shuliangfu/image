# @dreamer/image

> Image processing library compatible with Deno and Bun. Resize, crop, convert,
> compress, watermark, and extract image info.

[English](./README.md) · [中文 (Chinese)](./docs/zh-CN/README.md)

[![JSR](https://jsr.io/badges/@dreamer/image)](https://jsr.io/@dreamer/image)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-60%20passed-green)](./docs/en-US/TEST_REPORT.md)

---

## Features

- **Resize**: Aspect ratio preservation; multiple fit modes (contain, cover,
  fill, inside, outside); quality 0–100; batch resize
- **Crop**: Rectangle crop with x, y, width, height; precise coordinate control
- **Convert**: JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF; auto format detection;
  quality 0–100; batch conversion
- **Compress**: All common formats (JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF)
  - **Lossy/lossless**: Controlled by `quality` (100 = lossless, &lt;100 =
    lossy)
  - Quality 0–100; format-specific defaults (e.g. PNG/GIF 100,
    JPEG/WebP/AVIF 80)
- **Watermark**: Text and image watermarks; position (corners, center); opacity
  (0–1); multiple watermarks
- **Extract info**: Width, height, format, MIME type, file size, EXIF when
  available

## Use cases

- Image upload and processing (avatars, galleries)
- Thumbnail generation (albums, image lists)
- Format conversion (e.g. to WebP/AVIF)
- Compression for smaller files and faster loading
- Watermarks for copyright or branding
- Metadata and dimension extraction

## Installation

```bash
deno add jsr:@dreamer/image
# client (browser)
deno add jsr:@dreamer/image/client
```

## Runtime compatibility

- **Deno**: 2.6+
- **Bun**: 1.3.5+
- **Server**: ImageMagick CLI; auto-detect/install on macOS; file system access
  required
- **Client**: Browser Canvas/Image APIs; see
  [Client docs](./docs/en-US/client/README.md)

## Server usage

### Prerequisites

Install ImageMagick. The library can auto-detect and attempt install on macOS.

**macOS**: `brew install imagemagick`\
**Linux (Ubuntu/Debian)**: `sudo apt-get install -y imagemagick`\
**Linux (CentOS/RHEL)**: `sudo yum install -y ImageMagick`\
**Windows**: Download from
[ImageMagick](https://imagemagick.org/script/download.php).

### Basic usage

```typescript
import {
  addWatermark,
  compress,
  convert,
  createImageProcessor,
  crop,
  extractInfo,
  resize,
} from "jsr:@dreamer/image";
import { readFile, writeFile } from "@dreamer/runtime-adapter";

// Option 1: Convenience functions (recommended)
// The library auto-detects and can install ImageMagick if missing

const imageBuffer = await readFile("./input.jpg");

const resized = await resize(imageBuffer, {
  width: 800,
  height: 600,
  fit: "contain", // or "cover", "fill", "inside", "outside"
  quality: 90,
});

const cropped = await crop(imageBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});

const converted = await convert(imageBuffer, {
  format: "webp",
  quality: 85,
});

const compressed = await compress(imageBuffer, {
  quality: 80,
  format: "webp",
});

const lossless = await compress(imageBuffer, {
  quality: 100,
  format: "png",
});

const watermarked = await addWatermark(imageBuffer, {
  type: "text",
  text: "© 2024 My Company",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

const watermarkedImage = await addWatermark(imageBuffer, {
  type: "image",
  image: await readFile("./logo.png"),
  position: "top-right",
  opacity: 0.7,
});

const info = await extractInfo(imageBuffer);

await writeFile("./output.jpg", resized);
```

### Advanced configuration

```typescript
import { createImageProcessor } from "jsr:@dreamer/image";

const processor = await createImageProcessor({
  magickPath: "/usr/local/bin/magick",
  tempDir: "./temp",
  autoInstall: true,
});

const resized = await processor.resize(imageBuffer, {
  width: 800,
  height: 600,
});
```

### Using file paths

```typescript
const resized = await resize("./input.jpg", {
  width: 800,
  height: 600,
});
await writeFile("./output.jpg", resized);
```

## Client usage

The client uses the browser Canvas API with no extra dependencies. See
[Client docs](./docs/en-US/client/README.md).

```typescript
import {
  addWatermark,
  compress,
  convert,
  crop,
  extractInfo,
  resize,
} from "jsr:@dreamer/image/client";

const fileInput = document.querySelector(
  'input[type="file"]',
) as HTMLInputElement;
const file = fileInput.files?.[0];
if (!file) return;

const arrayBuffer = await file.arrayBuffer();

const resizedBlob = await resize(arrayBuffer, {
  width: 800,
  height: 600,
  quality: 0.9, // client uses 0–1
});

const previewUrl = URL.createObjectURL(resizedBlob);
const img = document.createElement("img");
img.src = previewUrl;
document.body.appendChild(img);
```

## API reference

### Core functions

#### `resize(image, options)`

Resize image.

- **image**: `Uint8Array | string` — image data or file path
- **options**: `ResizeOptions` — width, height, fit, quality (0–100)
- **Returns**: `Promise<Uint8Array>`

#### `crop(image, options)`

Crop image.

- **image**: `Uint8Array | string`
- **options**: `CropOptions` — x, y, width, height
- **Returns**: `Promise<Uint8Array>`

#### `convert(image, options)`

Convert format.

- **options**: `ConvertOptions` — format, quality (0–100)
- **Returns**: `Promise<Uint8Array>`

#### `compress(image, options)`

Compress image.

- **options**: `CompressOptions`
  - `quality`: 0–100 (100 = lossless, &lt;100 = lossy); default by format
    (PNG/GIF 100, others 80)
  - `format`: optional, default `jpeg`
- **Returns**: `Promise<Uint8Array>`

#### `addWatermark(image, options)`

Add watermark.

- **options**: `WatermarkOptions` — type (text | image), text, image, position,
  fontSize, color, opacity
- **Returns**: `Promise<Uint8Array>`

#### `extractInfo(image)`

Extract image info.

- **Returns**: `Promise<ImageInfo>` — width, height, format, mimeType, size

### Type definitions

```typescript
interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "fill" | "inside" | "outside";
  quality?: number; // 0–100
}

interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConvertOptions {
  format: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif";
  quality?: number; // 0–100
}

interface CompressOptions {
  quality?: number; // 0–100
  format?: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif";
}

interface WatermarkOptions {
  type: "text" | "image";
  text?: string;
  image?: Uint8Array | string;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  fontSize?: number;
  color?: string;
  opacity?: number; // 0–1
}

interface ImageInfo {
  width: number;
  height: number;
  format: string;
  mimeType: string;
  size: number;
}
```

## Supported formats

- **Input/Output**: JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF

### Compression

- **Lossy**: `quality < 100` — smaller files; use for JPEG, WebP, AVIF.
- **Lossless**: `quality = 100` — keep quality; use for PNG, GIF.
- **Format tips**: Web/AVIF or WebP for size; JPEG for compatibility; PNG for
  transparency; GIF for animation.

## Auto-install ImageMagick

The library checks for ImageMagick and, on macOS with Homebrew, can try to
install it. On other systems it shows install instructions and commands.

## Performance

- **Server**: ImageMagick CLI; temporary files are created and cleaned
  automatically.
- **Client**: Canvas API; suitable for small/medium images; limit file size for
  large files.

## More

- [Client documentation](./docs/en-US/client/README.md)
- [ImageMagick](https://imagemagick.org/)

## Changelog

**v1.0.2** (2026-02-19) — Changed: i18n init runs automatically in module; entry
files no longer call init. [Full changelog](./docs/en-US/CHANGELOG.md)

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
