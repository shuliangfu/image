/**
 * @fileoverview Image 客户端模拟测试
 *
 * 使用模拟的浏览器 API（Canvas、Image、Blob）来测试客户端功能
 */

/// <reference lib="dom" />

import { IS_DENO } from "@dreamer/runtime-adapter";
import {
  afterEach,
  beforeEach,
  cleanupAllBrowsers,
  describe,
  expect,
  it,
} from "@dreamer/test";
import {
  addWatermark,
  compress,
  convert,
  crop,
  extractInfo,
  resize,
} from "../src/client/mod.ts";

/**
 * 模拟的 Image 对象
 */
class MockImage {
  width: number = 0;
  height: number = 0;
  src: string = "";
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;

  constructor() {
    // 模拟图片加载，延迟触发 onload
    setTimeout(() => {
      if (this.onload) {
        // 从 src 中提取尺寸信息（如果是 blob URL，使用默认尺寸）
        if (this.src.startsWith("blob:")) {
          this.width = 800;
          this.height = 600;
        } else {
          // 从 URL 参数中提取尺寸（用于测试）
          const match = this.src.match(/width=(\d+)&height=(\d+)/);
          if (match) {
            this.width = parseInt(match[1], 10);
            this.height = parseInt(match[2], 10);
          } else {
            this.width = 800;
            this.height = 600;
          }
        }
        this.onload();
      }
    }, 10);
  }
}

/**
 * 模拟的 Canvas 2D 上下文
 */
class MockCanvasRenderingContext2D {
  canvas: MockCanvas;
  drawImageCalls: Array<{
    image: MockImage;
    dx?: number;
    dy?: number;
    dWidth?: number;
    dHeight?: number;
    sx?: number;
    sy?: number;
    sWidth?: number;
    sHeight?: number;
  }> = [];
  fillTextCalls: Array<{ text: string; x: number; y: number }> = [];
  fillStyle: string = "";
  font: string = "";
  globalAlpha: number = 1;
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";

  constructor(canvas: MockCanvas) {
    this.canvas = canvas;
  }

  drawImage(
    image: MockImage,
    dxOrSx?: number,
    dyOrSy?: number,
    dWidthOrSWidth?: number,
    dHeightOrSHeight?: number,
    sx?: number,
    sy?: number,
    sWidth?: number,
    sHeight?: number,
  ): void {
    if (sx !== undefined) {
      // 9 参数版本：drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      this.drawImageCalls.push({
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        dx: dxOrSx,
        dy: dyOrSy,
        dWidth: dWidthOrSWidth,
        dHeight: dHeightOrSHeight,
      });
    } else if (dWidthOrSWidth !== undefined) {
      // 5 参数版本：drawImage(image, dx, dy, dWidth, dHeight)
      this.drawImageCalls.push({
        image,
        dx: dxOrSx,
        dy: dyOrSy,
        dWidth: dWidthOrSWidth,
        dHeight: dHeightOrSHeight,
      });
    } else {
      // 3 参数版本：drawImage(image, dx, dy)
      this.drawImageCalls.push({
        image,
        dx: dxOrSx,
        dy: dyOrSy,
      });
    }
  }

  fillText(text: string, x: number, y: number): void {
    this.fillTextCalls.push({ text, x, y });
  }

  measureText(text: string): TextMetrics {
    // 模拟测量文本，返回一个简单的 TextMetrics 对象
    return {
      width: text.length * 10, // 简单估算：每个字符 10px
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.length * 10,
      actualBoundingBoxAscent: 20,
      actualBoundingBoxDescent: 5,
      fontBoundingBoxAscent: 20,
      fontBoundingBoxDescent: 5,
      emHeightAscent: 20,
      emHeightDescent: 5,
      hangingBaseline: 15,
      alphabeticBaseline: 0,
      ideographicBaseline: -5,
    };
  }

  clearRect(): void {
    // 模拟清除
  }

  save(): void {
    // 模拟保存状态
  }

  restore(): void {
    // 模拟恢复状态
  }
}

/**
 * 模拟的 Canvas 对象
 */
class MockCanvas {
  width: number = 0;
  height: number = 0;
  private _context: MockCanvasRenderingContext2D | null = null;

  getContext(contextId: "2d"): MockCanvasRenderingContext2D | null {
    if (contextId === "2d") {
      if (!this._context) {
        this._context = new MockCanvasRenderingContext2D(this);
      }
      return this._context;
    }
    return null;
  }

  toBlob(
    callback: (blob: Blob | null) => void,
    mimeType?: string,
    quality?: number,
  ): void {
    // 模拟生成 Blob
    const blob = new Blob(["mock image data"], {
      type: mimeType || "image/png",
    });
    setTimeout(() => callback(blob), 10);
  }
}

/**
 * 设置浏览器 API 模拟
 */
function setupBrowserMocks() {
  // 保存原始的全局对象
  const originalImage = (globalThis as any).Image;
  const originalCanvas = (globalThis as any).HTMLCanvasElement;

  // 模拟 Image 构造函数
  (globalThis as any).Image = MockImage;

  // 模拟 HTMLCanvasElement
  (globalThis as any).HTMLCanvasElement = class extends MockCanvas {};

  // 模拟 document.createElement
  const originalCreateElement = (globalThis as any).document?.createElement;
  if ((globalThis as any).document) {
    (globalThis as any).document.createElement = function (
      tagName: string,
    ): any {
      if (tagName === "canvas") {
        return new MockCanvas();
      }
      if (originalCreateElement) {
        return originalCreateElement.call(this, tagName);
      }
      return {};
    };
  } else {
    (globalThis as any).document = {
      createElement: (tagName: string) => {
        if (tagName === "canvas") {
          return new MockCanvas();
        }
        return {};
      },
    };
  }

  // 模拟 URL.createObjectURL
  const originalCreateObjectURL = (globalThis as any).URL?.createObjectURL;
  if ((globalThis as any).URL) {
    (globalThis as any).URL.createObjectURL = function (blob: Blob): string {
      return `blob:mock-url-${Date.now()}`;
    };
  } else {
    (globalThis as any).URL = {
      createObjectURL: (blob: Blob) => `blob:mock-url-${Date.now()}`,
      revokeObjectURL: () => {},
    };
  }

  return {
    restore: () => {
      if (originalImage) {
        (globalThis as any).Image = originalImage;
      }
      if (originalCanvas) {
        (globalThis as any).HTMLCanvasElement = originalCanvas;
      }
      if (originalCreateElement && (globalThis as any).document) {
        (globalThis as any).document.createElement = originalCreateElement;
      }
      if (originalCreateObjectURL && (globalThis as any).URL) {
        (globalThis as any).URL.createObjectURL = originalCreateObjectURL;
      }
    },
  };
}

describe("Image 客户端（模拟测试）", () => {
  let mockRestore: (() => void) | null = null;

  beforeEach(() => {
    mockRestore = setupBrowserMocks().restore;
  });

  afterEach(() => {
    if (mockRestore) {
      mockRestore();
      mockRestore = null;
    }
  });

  describe("resize", () => {
    it("应该缩放图片", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await resize(imageData, {
        width: 400,
        height: 300,
        quality: 0.9,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/png");
    });

    it("应该支持只指定宽度", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await resize(imageData, {
        width: 400,
        quality: 0.8,
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it("应该支持只指定高度", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await resize(imageData, {
        height: 300,
        quality: 0.8,
      });

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe("crop", () => {
    it("应该裁剪图片", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await crop(imageData, {
        x: 10,
        y: 20,
        width: 200,
        height: 150,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/png");
    });
  });

  describe("convert", () => {
    it("应该转换图片格式为 JPEG", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await convert(imageData, {
        format: "jpeg",
        quality: 0.85,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/jpeg");
    });

    it("应该转换图片格式为 WebP", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await convert(imageData, {
        format: "webp",
        quality: 0.8,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/webp");
    });

    it("应该转换图片格式为 PNG", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await convert(imageData, {
        format: "png",
        quality: 1.0,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("image/png");
    });
  });

  describe("compress", () => {
    it("应该压缩图片", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await compress(imageData, {
        quality: 0.7,
        format: "jpeg",
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it("应该支持默认格式压缩", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await compress(imageData, {
        quality: 0.8,
      });

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe("addWatermark", () => {
    it("应该添加文字水印", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const result = await addWatermark(imageData, {
        type: "text",
        text: "Test Watermark",
        position: "bottom-right",
        fontSize: 24,
        color: "#FFFFFF",
        opacity: 0.8,
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it("应该添加图片水印", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const watermarkData = new Uint8Array([5, 6, 7, 8]);
      const result = await addWatermark(imageData, {
        type: "image",
        image: watermarkData,
        position: "top-right",
        opacity: 0.5,
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it("应该支持所有水印位置", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const positions = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "center",
      ] as const;

      for (const position of positions) {
        const result = await addWatermark(imageData, {
          type: "text",
          text: "Test",
          position,
        });
        expect(result).toBeInstanceOf(Blob);
      }
    });
  });

  describe("extractInfo", () => {
    it("应该提取图片信息", async () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const info = await extractInfo(imageData);

      expect(info).toBeTruthy();
      expect(info.width).toBeGreaterThan(0);
      expect(info.height).toBeGreaterThan(0);
      expect(info.format).toBeTruthy();
      expect(info.mimeType).toBeTruthy();
      expect(info.size).toBeGreaterThan(0);
    });

    it("应该从字符串 URL 提取图片信息", async () => {
      const info = await extractInfo("https://example.com/image.jpg");

      expect(info).toBeTruthy();
      expect(info.width).toBeGreaterThan(0);
      expect(info.height).toBeGreaterThan(0);
    });
  });

  // Bun 下显式注册 cleanup 以与 Deno 数量一致（51）；Deno 下由 runner 注入，此处 skip
  it.skipIf(
    IS_DENO,
    "\uFFFF@dreamer/test cleanup browsers",
    async () => {
      await cleanupAllBrowsers();
    },
  );
});
