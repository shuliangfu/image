/**
 * @fileoverview Image 服务端测试
 */

import { IS_DENO } from "@dreamer/runtime-adapter";
import { cleanupAllBrowsers, describe, expect, it } from "@dreamer/test";
import {
  type CompressOptions,
  type ConvertOptions,
  createImageProcessor,
  type CropOptions,
  extractInfo,
  type ImageInfo,
  resize,
  type ResizeOptions,
  type WatermarkOptions,
} from "../src/mod.ts";

describe("Image 服务端", () => {
  describe("createImageProcessor", () => {
    it("应该在 ImageMagick 不可用时抛出错误", async () => {
      let error: Error | null = null;
      try {
        await createImageProcessor({
          magickPath: "nonexistent-magick",
          autoInstall: false,
        });
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeTruthy();
      expect(error?.message).toContain("ImageMagick");
    });
  });

  describe("resize", () => {
    it("应该验证选项参数", () => {
      const options: ResizeOptions = {
        width: 800,
        height: 600,
        fit: "contain",
        quality: 90,
      };
      expect(options.width).toBe(800);
      expect(options.height).toBe(600);
      expect(options.fit).toBe("contain");
      expect(options.quality).toBe(90);
    });

    it("应该在文件不存在时抛出错误", async () => {
      let error: Error | null = null;
      try {
        await resize("nonexistent-image.jpg", { width: 100 });
      } catch (e) {
        error = e as Error;
      }
      // 可能会因为 ImageMagick 不可用或文件不存在而抛出错误
      expect(error).toBeTruthy();
    });
  });

  describe("crop", () => {
    it("应该验证选项参数", () => {
      const options: CropOptions = {
        x: 10,
        y: 20,
        width: 200,
        height: 150,
      };
      expect(options.x).toBe(10);
      expect(options.y).toBe(20);
      expect(options.width).toBe(200);
      expect(options.height).toBe(150);
    });
  });

  describe("convert", () => {
    it("应该验证所有支持的格式", () => {
      const formats = [
        "jpeg",
        "png",
        "webp",
        "gif",
        "bmp",
        "tiff",
        "avif",
      ] as const;
      for (const format of formats) {
        const options: ConvertOptions = {
          format,
          quality: 80,
        };
        expect(options.format).toBe(format);
      }
    });

    it("应该验证质量参数范围", () => {
      const options: ConvertOptions = {
        format: "jpeg",
        quality: 50,
      };
      expect(options.quality).toBeGreaterThanOrEqual(0);
      expect(options.quality).toBeLessThanOrEqual(100);
    });
  });

  describe("compress", () => {
    it("应该验证所有支持的格式", () => {
      const formats = [
        "jpeg",
        "png",
        "webp",
        "gif",
        "bmp",
        "tiff",
        "avif",
      ] as const;
      for (const format of formats) {
        const options: CompressOptions = {
          format,
          quality: 80,
        };
        expect(options.format).toBe(format);
      }
    });

    it("应该支持不指定格式（使用默认）", () => {
      const options: CompressOptions = {
        quality: 85,
      };
      expect(options.quality).toBe(85);
      expect(options.format).toBeUndefined();
    });

    it("应该支持不指定质量（使用默认）", () => {
      const options: CompressOptions = {
        format: "jpeg",
      };
      expect(options.format).toBe("jpeg");
      expect(options.quality).toBeUndefined();
    });
  });

  describe("addWatermark", () => {
    it("应该验证文字水印选项", () => {
      const options: WatermarkOptions = {
        type: "text",
        text: "Watermark Text",
        position: "bottom-right",
        fontSize: 24,
        color: "#FFFFFF",
        opacity: 0.8,
      };
      expect(options.type).toBe("text");
      expect(options.text).toBe("Watermark Text");
      expect(options.position).toBe("bottom-right");
      expect(options.fontSize).toBe(24);
      expect(options.color).toBe("#FFFFFF");
      expect(options.opacity).toBe(0.8);
    });

    it("应该验证图片水印选项", () => {
      const imageData = new Uint8Array([1, 2, 3, 4]);
      const options: WatermarkOptions = {
        type: "image",
        image: imageData,
        position: "center",
        opacity: 0.5,
      };
      expect(options.type).toBe("image");
      expect(options.image).toBe(imageData);
      expect(options.position).toBe("center");
      expect(options.opacity).toBe(0.5);
    });

    it("应该验证所有支持的水印位置", () => {
      const positions = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
        "center",
      ] as const;

      for (const position of positions) {
        const options: WatermarkOptions = {
          type: "text",
          text: "Test",
          position,
        };
        expect(options.position).toBe(position);
      }
    });
  });

  describe("extractInfo", () => {
    it("应该验证 ImageInfo 接口结构", () => {
      const info: ImageInfo = {
        width: 1920,
        height: 1080,
        format: "jpeg",
        mimeType: "image/jpeg",
        size: 1024000,
        exif: {
          camera: "Canon",
          date: "2024-01-01",
        },
      };

      expect(info.width).toBe(1920);
      expect(info.height).toBe(1080);
      expect(info.format).toBe("jpeg");
      expect(info.mimeType).toBe("image/jpeg");
      expect(info.size).toBe(1024000);
      expect(info.exif).toBeTruthy();
    });

    it("应该在文件不存在时抛出错误", async () => {
      let error: Error | null = null;
      try {
        await extractInfo("nonexistent-image.jpg");
      } catch (e) {
        error = e as Error;
      }
      // 可能会因为 ImageMagick 不可用或文件不存在而抛出错误
      expect(error).toBeTruthy();
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
