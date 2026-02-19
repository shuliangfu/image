# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
