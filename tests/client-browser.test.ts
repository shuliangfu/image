/**
 * @fileoverview Image 客户端浏览器测试（真实 Chrome，非 mock）
 *
 * 使用 @dreamer/test 的 browser 集成，在真实浏览器中加载 @dreamer/image/client，
 * 验证 resize、crop、convert、compress、extractInfo、addWatermark 等 API。
 *
 * 运行前需安装 Chromium：npx playwright install chromium
 * 建议：deno test -A tests/client-browser.test.ts 或 bun test tests/client-browser.test.ts
 */

import { IS_DENO } from "@dreamer/runtime-adapter";
import {
  afterAll,
  cleanupAllBrowsers,
  describe,
  expect,
  it,
} from "@dreamer/test";

/** 1x1 透明 PNG（base64），用于浏览器内测试；evaluate 仅支持单参，故在注入时需内联此字面量 */
const MINIMAL_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** 在浏览器中设置 globalThis.__b64（仅接受单参 evaluate，故内联 base64） */
function setBrowserB64() {
  return () => {
    (globalThis as unknown as { __b64: string }).__b64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  };
}

const browserConfig = {
  timeout: 20_000,
  browser: {
    enabled: true,
    headless: true,
    browserSource: "test" as const,
    entryPoint: "tests/browser/client-entry.ts",
    globalName: "ImageClient",
    browserMode: false,
    moduleLoadTimeout: 15_000,
  },
};

describe("Image 客户端（浏览器测试）", () => {
  afterAll(async () => {
    await cleanupAllBrowsers();
  });

  it("应加载 ImageClient 并存在 resize/crop/convert 等 API", async (t) => {
    if (!t?.browser) return;
    const ok = await t.browser.evaluate(() => {
      const g =
        (globalThis as unknown as { ImageClient?: unknown }).ImageClient;
      if (!g || typeof g !== "object") return false;
      const api = g as Record<string, unknown>;
      return (
        typeof api.resize === "function" &&
        typeof api.crop === "function" &&
        typeof api.convert === "function" &&
        typeof api.compress === "function" &&
        typeof api.extractInfo === "function" &&
        typeof api.addWatermark === "function"
      );
    });
    expect(ok).toBe(true);
  }, browserConfig);

  it("应在浏览器中完成 resize", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const size = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: { resize: (a: Uint8Array, o: object) => Promise<Blob> };
      }).ImageClient;
      const blob = await client.resize(bin, {
        width: 10,
        height: 10,
        fit: "contain",
        quality: 0.9,
      });
      return blob.size;
    });
    expect(size).toBeGreaterThan(0);
  }, browserConfig);

  it("应在浏览器中完成 crop", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const size = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: { crop: (a: Uint8Array, o: object) => Promise<Blob> };
      }).ImageClient;
      const blob = await client.crop(bin, { x: 0, y: 0, width: 1, height: 1 });
      return blob.size;
    });
    expect(size).toBeGreaterThan(0);
  }, browserConfig);

  it("应在浏览器中完成 convert", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const size = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: { convert: (a: Uint8Array, o: object) => Promise<Blob> };
      }).ImageClient;
      const blob = await client.convert(bin, { format: "jpeg", quality: 0.9 });
      return blob.size;
    });
    expect(size).toBeGreaterThan(0);
  }, browserConfig);

  it("应在浏览器中完成 compress", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const size = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: {
          compress: (a: Uint8Array, o: object) => Promise<Blob>;
        };
      }).ImageClient;
      const blob = await client.compress(bin, { quality: 0.8, format: "jpeg" });
      return blob.size;
    });
    expect(size).toBeGreaterThan(0);
  }, browserConfig);

  it("应在浏览器中完成 extractInfo", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const info = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: {
          extractInfo: (
            a: Uint8Array,
          ) => Promise<{ width: number; height: number; format: string }>;
        };
      }).ImageClient;
      return await client.extractInfo(bin);
    });
    expect(info).toBeDefined();
    expect(info.width).toBe(1);
    expect(info.height).toBe(1);
    expect(info.format).toBeDefined();
  }, browserConfig);

  it("应在浏览器中完成 addWatermark（文字）", async (t) => {
    if (!t?.browser) return;
    await t.browser.evaluate(setBrowserB64());
    const size = await t.browser.evaluate(async () => {
      const bin = Uint8Array.from(
        atob((globalThis as unknown as { __b64: string }).__b64),
        (c: string) => c.charCodeAt(0),
      );
      const client = (globalThis as unknown as {
        ImageClient: {
          addWatermark: (a: Uint8Array, o: object) => Promise<Blob>;
        };
      }).ImageClient;
      const blob = await client.addWatermark(bin, {
        type: "text",
        text: "Test",
        position: "bottom-right",
        fontSize: 14,
        color: "#FFFFFF",
        opacity: 0.8,
      });
      return blob.size;
    });
    expect(size).toBeGreaterThan(0);
  }, browserConfig);

  // Bun 下显式 cleanup 以与 Deno 测试数量一致
  it.skipIf(IS_DENO, "\uFFFF@dreamer/test cleanup browsers", async () => {
    await cleanupAllBrowsers();
  });
}, { sanitizeResources: false, sanitizeOps: false });
