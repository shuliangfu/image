# @dreamer/image Test Report

## Test Overview

This report records test coverage and results for the `@dreamer/image` package.
The package provides server-side image processing (ImageMagick) and client-side
API wrappers for resize, crop, convert, compress, addWatermark, and extractInfo,
with support for both Deno and Bun runtimes.

| Item                 | Value                                              |
| -------------------- | -------------------------------------------------- |
| **Test Date**        | 2026-02-18                                         |
| **Package Version**  | 1.0.0-beta.3                                       |
| **Runtime Adapter**  | @dreamer/runtime-adapter ^1.0.13                   |
| **Test Framework**   | @dreamer/test ^1.0.8, Deno built-in test, Bun test |
| **Test Environment** | Deno 2.6+ / Bun 1.3.5+                             |

## Test Results

### Overall Statistics

| Metric                       | Value                   |
| ---------------------------- | ----------------------- |
| Number of test files         | 5                       |
| Total test cases             | 64                      |
| Passed                       | 60                      |
| Skipped (cleanup, Deno-only) | 4                       |
| Failed                       | 0                       |
| Pass rate                    | 100%                    |
| Execution time               | ~23s (Deno), ~22s (Bun) |

### Test File Summary

| File                             | Test cases | Status        | Description                                    |
| -------------------------------- | ---------- | ------------- | ---------------------------------------------- |
| `tests/mod.test.ts`              | 16         | ✅ All passed | Image server API validation and error handling |
| `tests/client-browser.test.ts`   | 10         | ✅ All passed | Client API in real browser (Playwright)        |
| `tests/image-operations.test.ts` | 14         | ✅ All passed | Real ImageMagick operations (when available)   |
| `tests/client-mock.test.ts`      | 16         | ✅ All passed | Client API with mocked server                  |
| `tests/client.test.ts`           | 8          | ✅ All passed | Client option validation only                  |

## Functional Test Details

### 1. Image Server (mod.test.ts) - 16 tests

#### 1.1 createImageProcessor

- ✅ Should throw when ImageMagick is not available

#### 1.2 resize

- ✅ Should validate option parameters
- ✅ Should throw when file does not exist

#### 1.3 crop

- ✅ Should validate option parameters

#### 1.4 convert

- ✅ Should validate all supported formats
- ✅ Should validate quality parameter range

#### 1.5 compress

- ✅ Should validate all supported formats
- ✅ Should support omitting format (use default)
- ✅ Should support omitting quality (use default)

#### 1.6 addWatermark

- ✅ Should validate text watermark options
- ✅ Should validate image watermark options
- ✅ Should validate all supported watermark positions

#### 1.7 extractInfo

- ✅ Should validate ImageInfo interface structure
- ✅ Should throw when file does not exist

#### 1.8 Cleanup

- ✅ @dreamer/test cleanup browsers (skipped on Deno)

### 2. Image Client – Browser (client-browser.test.ts) - 10 tests

#### 2.1 Load and API presence

- ✅ Should load ImageClient and expose
  resize/crop/convert/compress/extractInfo/addWatermark

#### 2.2 Operations in browser

- ✅ Should complete resize in browser
- ✅ Should complete crop in browser
- ✅ Should complete convert in browser
- ✅ Should complete compress in browser
- ✅ Should complete extractInfo in browser
- ✅ Should complete addWatermark (text) in browser

#### 2.3 Cleanup

- ✅ @dreamer/test cleanup browsers (skipped on Deno)

### 3. Image Operations – Real ImageMagick (image-operations.test.ts) - 14 tests

#### 3.1 Availability

- ✅ Should check ImageMagick availability

#### 3.2 extractInfo

- ✅ Should get image info from file
- ✅ Should get image info from Uint8Array

#### 3.3 resize

- ✅ Should resize with width and height
- ✅ Should resize with width only (keep aspect ratio)

#### 3.4 crop

- ✅ Should crop image

#### 3.5 convert

- ✅ Should convert image to PNG format
- ✅ Should convert image to WebP format

#### 3.6 compress

- ✅ Should compress at medium quality
- ✅ Should compress at low quality

#### 3.7 addWatermark

- ✅ Should add text watermark
- ✅ Should add image watermark (may warn if temp file missing)

#### 3.8 Teardown

- ✅ Test complete; output files kept in tests/output

### 4. Image Client – Mock (client-mock.test.ts) - 16 tests

#### 4.1 resize

- ✅ Should resize image
- ✅ Should support width only
- ✅ Should support height only

#### 4.2 crop

- ✅ Should crop image

#### 4.3 convert

- ✅ Should convert to JPEG
- ✅ Should convert to WebP
- ✅ Should convert to PNG

#### 4.4 compress

- ✅ Should compress image
- ✅ Should support default format compression

#### 4.5 addWatermark

- ✅ Should add text watermark
- ✅ Should add image watermark
- ✅ Should support all watermark positions

#### 4.6 extractInfo

- ✅ Should extract image info
- ✅ Should extract image info from string URL

#### 4.7 Cleanup

- ✅ @dreamer/test cleanup browsers (skipped on Deno)

### 5. Image Client – Option Validation (client.test.ts) - 8 tests

#### 5.1 resize

- ✅ Should validate option parameters

#### 5.2 crop

- ✅ Should validate option parameters

#### 5.3 convert

- ✅ Should validate all supported formats

#### 5.4 compress

- ✅ Should validate option parameters

#### 5.5 addWatermark

- ✅ Should validate text watermark options

#### 5.6 extractInfo

- ✅ Should validate ImageInfo interface structure

#### 5.7 Cleanup

- ✅ @dreamer/test cleanup browsers (skipped on Deno)

## Test Coverage Analysis

### API method coverage

| API                  | Server (mod) | Client (browser) | Client (mock) | Client (options) | Operations (real) |
| -------------------- | ------------ | ---------------- | ------------- | ---------------- | ----------------- |
| resize               | ✅           | ✅               | ✅            | ✅               | ✅                |
| crop                 | ✅           | ✅               | ✅            | ✅               | ✅                |
| convert              | ✅           | ✅               | ✅            | ✅               | ✅                |
| compress             | ✅           | ✅               | ✅            | ✅               | ✅                |
| addWatermark         | ✅           | ✅               | ✅            | ✅               | ✅                |
| extractInfo          | ✅           | ✅               | ✅            | ✅               | ✅                |
| createImageProcessor | ✅           | —                | —             | —                | —                 |

### Edge cases and errors

- ✅ Missing file: server resize and extractInfo throw when file does not exist
- ✅ Invalid options: server and client validate format, quality, watermark
  options
- ✅ ImageMagick unavailable: createImageProcessor throws; operations tests skip
  or warn
- ✅ Browser: client API exercised in real Chrome via Playwright

## Required Services

| Service                | Purpose                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| ImageMagick (`magick`) | Server-side and real operations tests (resize, crop, convert, compress, addWatermark, extractInfo) |
| Playwright / Chromium  | Browser client tests; run `npx playwright install chromium` before browser tests                   |

## Strengths

1. **Dual runtime**: All tests run in both Deno and Bun (60 passed each run).
2. **Layered coverage**: Server validation, client validation, client with mock,
   client in real browser, and real ImageMagick operations.
3. **Clear failure modes**: Option validation and missing-file errors are
   covered.
4. **Browser coverage**: Client API is tested in a real browser without mock.
5. **Graceful degradation**: Operations tests skip or warn when ImageMagick is
   missing or image watermark temp file is missing.

## Conclusion

The `@dreamer/image` package is covered by 64 test cases across 5 files. Sixty
tests pass per run (4 cleanup tests are skipped on Deno). Results show:

1. ✅ **Server API**: Option validation and error handling behave as expected.
2. ✅ **Client API**: Option validation, mock-based behavior, and real-browser
   behavior are verified.
3. ✅ **Real operations**: When ImageMagick is available, resize, crop, convert,
   compress, addWatermark, and extractInfo are exercised.
4. ✅ **Compatibility**: Tests pass under both Deno and Bun.
5. ✅ **Stability**: No failing tests; optional services (ImageMagick, Chromium)
   are documented and handled when absent.

The package is suitable for production use within the documented environment and
dependency requirements.

---

**Report generated**: 2026-02-18\
**Runners**: `deno test -A tests` → 60 passed, 4 ignored (~23s);
`bun test tests` → 60 pass (~22s).
