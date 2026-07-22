# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-07-23

### Added

- **Node.js compatibility**: Image now runs on Node.js 22+ alongside Deno and
  Bun. All filesystem, environment, and process operations go through
  `@dreamer/runtime-adapter` (v1.2.2, Node-supported). No `src/` changes needed
  — `getOS()` already falls through to `process.platform` for Bun/Node, and
  ImageMagick invocations use the cross-runtime `createCommand().output()` API.
- **Node test infrastructure**: `package.json` with `test:node` script
  (`tsx --tsconfig tsconfig.json --test --test-force-exit tests/mod.test.ts
  tests/image-operations.test.ts`), `tsconfig.json`. Browser tests
  (`client-browser.test.ts`, `client.test.ts`, `client-mock.test.ts`) excluded
  from Node CI (require Chromium + @dreamer/esbuild). `image-operations.test.ts`
  skips gracefully when ImageMagick is not installed
  (`checkImageMagickAvailable()`).
- **CI workflow** created (9 jobs — 3 Deno v2.9 + 3 Bun + 3 Node 22). Deno/Bun
  jobs install Playwright Chromium 1.59.1 and run all tests (including browser);
  Windows Bun runs server-side tests only (avoids chromium hang bug,
  oven-sh/bun#15679); Node jobs run `test:node` (no Chromium).
- `minimumDependencyAge: 0` and `nodeModulesDir: "auto"` in `deno.json` for
  freshly published `@dreamer/*` dependencies.

### Changed

- Dependencies upgraded: `@dreamer/i18n` ^1.1.2, `@dreamer/test` ^1.2.3,
  `@dreamer/runtime-adapter` ^1.2.2.
- `publish.yml` uses `npx jsr publish` (type-check on publish).

### Documentation

- Test report (en-US and zh-CN) updated to three-end results: Deno 60 (4
  ignored), Bun 58, Node 28.

---

## [1.0.2] - 2026-02-19

### Changed

- **i18n**: Initialization now runs automatically when the i18n module is
  loaded. Entry files no longer import or call `initImageI18n`; remove any such
  usage from your code.

---

## [1.0.1] - 2026-02-19

### Changed

- **i18n**: Renamed translation method from `$t` to `$tr` to avoid conflict with
  global `$t`. Update existing code to use `$tr` for package messages.

---

## [1.0.0] - 2026-02-18

### Added

- **Stable 1.0.0 release**: Image processing library for Deno and Bun.
- **Server (ImageMagick)**: `resize`, `crop`, `convert`, `compress`,
  `addWatermark`, `extractInfo`; file path or buffer input; quality 0–100; fit
  modes (contain, cover, fill, inside, outside); batch operations;
  `createImageProcessor` for custom config (magickPath, tempDir, autoInstall).
- **Client (Canvas API)**: Same API surface via `jsr:@dreamer/image/client`;
  quality 0–1; returns `Blob`; no extra dependencies.
- **Formats**: JPEG, PNG, WebP, GIF, BMP, TIFF, AVIF (input/output).
- **Compression**: Lossy (`quality < 100`) and lossless (`quality = 100`);
  format-specific defaults (e.g. PNG/GIF 100, JPEG/WebP/AVIF 80).
- **Watermark**: Text and image; position (corners, center); opacity.
- **Documentation**: Full English README at repository root; Chinese docs in
  `docs/zh-CN/` (README, CHANGELOG, TEST_REPORT, client README); `docs/en-US/`
  for CHANGELOG, TEST_REPORT, and client README.
- **Server i18n**: Install hints, console messages, and error messages use
  `$t()` from `./i18n.ts` with `en-US` and `zh-CN` locale files;
  `createImageProcessor({ lang })` and `initImageI18n()` / `setImageLocale()`
  for locale; compatible with i18n plugins that recognize `$t` keys.

### Notes

- Server requires ImageMagick CLI; auto-detect/install on macOS. Use
  `@dreamer/runtime-adapter` for file and path operations in runnable examples
  and tests.
