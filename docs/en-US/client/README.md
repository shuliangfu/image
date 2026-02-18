# @dreamer/image/client

> Browser image processing library: resize, crop, convert, compress, watermark,
> and extract image info.

[![JSR](https://jsr.io/badges/@dreamer/image/client)](https://jsr.io/@dreamer/image/client)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../../LICENSE)

---

Uses native Canvas and Image APIs; no extra dependencies.

## Features

- **Resize**: Aspect ratio preservation, multiple fit modes (contain, cover,
  fill), quality 0–1
- **Crop**: Rectangle crop with x, y, width, height
- **Convert**: JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF; auto format detection
- **Compress**: Quality 0–1, format options (jpeg, webp)
- **Watermark**: Text and image watermarks; position and opacity
- **Extract info**: Width, height, format, MIME type, file size

## Installation

```bash
deno add jsr:@dreamer/image
```

## Import

```typescript
import {
  addWatermark,
  compress,
  convert,
  crop,
  extractInfo,
  resize,
} from "jsr:@dreamer/image/client";
```

## Environment

- **Browser**: All modern browsers
- **APIs**: Canvas API, Image API, Blob API

## Quick start

### Basic usage

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
  fit: "contain",
  quality: 0.9,
});

const croppedBlob = await crop(arrayBuffer, {
  x: 100,
  y: 100,
  width: 400,
  height: 400,
});

const convertedBlob = await convert(arrayBuffer, {
  format: "webp",
  quality: 0.85,
});

const compressedBlob = await compress(arrayBuffer, {
  quality: 0.8,
  format: "jpeg",
});

const watermarkedBlob = await addWatermark(arrayBuffer, {
  type: "text",
  text: "© 2024",
  position: "bottom-right",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 0.8,
});

const info = await extractInfo(arrayBuffer);
// { width, height, format, mimeType, size }

const previewUrl = URL.createObjectURL(resizedBlob);
```

### File upload

```typescript
async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  const compressed = await compress(arrayBuffer, {
    quality: 0.8,
    format: "jpeg",
  });
  const formData = new FormData();
  formData.append("image", compressed, "compressed.jpg");
  await fetch("/api/upload", { method: "POST", body: formData });
}
```

## API

### `resize(image, options)` → `Promise<Blob>`

- **image**: `ArrayBuffer | Uint8Array | string` (Data URL)
- **options**: `ResizeOptions` — width, height, fit (`contain` | `cover` |
  `fill`), quality (0–1)

### `crop(image, options)` → `Promise<Blob>`

- **image**: `ArrayBuffer | Uint8Array | string`
- **options**: `CropOptions` — x, y, width, height

### `convert(image, options)` → `Promise<Blob>`

- **options**: `ConvertOptions` — format, quality (0–1)

### `compress(image, options)` → `Promise<Blob>`

- **options**: `CompressOptions` — quality (0–1), format (`jpeg` | `webp`)

### `addWatermark(image, options)` → `Promise<Blob>`

- **options**: `WatermarkOptions` — type (`text` | `image`), text, image,
  position, fontSize, color, opacity (0–1)

### `extractInfo(image)` → `Promise<ImageInfo>`

- Returns: width, height, format, mimeType, size

## Types

```typescript
interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "fill";
  quality?: number; // 0–1
}

interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConvertOptions {
  format: "jpeg" | "png" | "webp" | "gif" | "bmp" | "tiff" | "avif";
  quality?: number; // 0–1
}

interface CompressOptions {
  quality?: number; // 0–1
  format?: "jpeg" | "webp";
}

interface WatermarkOptions {
  type: "text" | "image";
  text?: string;
  image?: ArrayBuffer | Uint8Array | string;
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

## Formats

- **Input/Output**: JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF

## Notes

- **Blob URLs**: Call `URL.revokeObjectURL()` when done.
- **Quality**: Client uses 0–1; server uses 0–100.
- **Return type**: Client returns `Blob`; server returns `Uint8Array`.

[← Back to main docs](../../../README.md)

---

Apache License 2.0 — see [LICENSE](../../../LICENSE).
