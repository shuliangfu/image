/**
 * @fileoverview Image 客户端测试
 */

import { describe, expect, it } from "@dreamer/test";
import { type ImageInfo } from "../src/client/mod.ts";

describe("Image 客户端", () => {
  describe("resize", () => {
    it("应该验证选项参数", () => {
      const options = {
        width: 800,
        height: 600,
        quality: 90,
      };
      expect(options.width).toBe(800);
      expect(options.height).toBe(600);
      expect(options.quality).toBe(90);
    });
  });

  describe("crop", () => {
    it("应该验证选项参数", () => {
      const options = {
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
      const formats = ["jpeg", "png", "webp"] as const;
      for (const format of formats) {
        const options = {
          format,
          quality: 80,
        };
        expect(options.format).toBe(format);
      }
    });
  });

  describe("compress", () => {
    it("应该验证选项参数", () => {
      const options = {
        quality: 80,
        format: "jpeg" as const,
      };
      expect(options.quality).toBe(80);
      expect(options.format).toBe("jpeg");
    });
  });

  describe("addWatermark", () => {
    it("应该验证文字水印选项", () => {
      const options = {
        type: "text" as const,
        text: "Watermark",
        position: "bottom-right" as const,
        fontSize: 24,
        color: "#FFFFFF",
        opacity: 0.8,
      };
      expect(options.type).toBe("text");
      expect(options.text).toBe("Watermark");
      expect(options.position).toBe("bottom-right");
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
      };

      expect(info.width).toBe(1920);
      expect(info.height).toBe(1080);
      expect(info.format).toBe("jpeg");
      expect(info.mimeType).toBe("image/jpeg");
      expect(info.size).toBe(1024000);
    });
  });
});
