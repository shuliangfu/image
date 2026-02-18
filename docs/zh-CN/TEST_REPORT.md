# @dreamer/image 测试报告

## 测试概览

本报告记录 `@dreamer/image`
包的测试覆盖与结果。该包提供服务端图片处理（ImageMagick）与客户端 API
封装（resize、crop、convert、compress、addWatermark、extractInfo），支持 Deno 与
Bun 双运行时。

| 项目             | 取值                                          |
| ---------------- | --------------------------------------------- |
| **测试日期**     | 2026-02-18                                    |
| **包版本**       | 1.0.0-beta.3                                  |
| **运行时适配器** | @dreamer/runtime-adapter ^1.0.13              |
| **测试框架**     | @dreamer/test ^1.0.8、Deno 内置测试、Bun test |
| **测试环境**     | Deno 2.6+ / Bun 1.3.5+                        |

## 测试结果

### 总体统计

| 指标                          | 数值                          |
| ----------------------------- | ----------------------------- |
| 测试文件数                    | 5                             |
| 测试用例总数                  | 64                            |
| 通过                          | 60                            |
| 跳过（cleanup，仅 Deno 跳过） | 4                             |
| 失败                          | 0                             |
| 通过率                        | 100%                          |
| 执行时间                      | 约 23s（Deno）、约 22s（Bun） |

### 测试文件汇总

| 文件                             | 用例数 | 状态        | 说明                                 |
| -------------------------------- | ------ | ----------- | ------------------------------------ |
| `tests/mod.test.ts`              | 16     | ✅ 全部通过 | 服务端 API 校验与错误处理            |
| `tests/client-browser.test.ts`   | 10     | ✅ 全部通过 | 真实浏览器内客户端 API（Playwright） |
| `tests/image-operations.test.ts` | 14     | ✅ 全部通过 | 实际 ImageMagick 操作（可用时）      |
| `tests/client-mock.test.ts`      | 16     | ✅ 全部通过 | 客户端 API（mock 服务端）            |
| `tests/client.test.ts`           | 8      | ✅ 全部通过 | 仅客户端选项校验                     |

## 功能测试详情

### 1. 图片服务端 (mod.test.ts) - 16 项

#### 1.1 createImageProcessor

- ✅ ImageMagick 不可用时应抛出错误

#### 1.2 resize

- ✅ 应校验选项参数
- ✅ 文件不存在时应抛出错误

#### 1.3 crop

- ✅ 应校验选项参数

#### 1.4 convert

- ✅ 应校验所有支持的格式
- ✅ 应校验质量参数范围

#### 1.5 compress

- ✅ 应校验所有支持的格式
- ✅ 应支持不指定格式（使用默认）
- ✅ 应支持不指定质量（使用默认）

#### 1.6 addWatermark

- ✅ 应校验文字水印选项
- ✅ 应校验图片水印选项
- ✅ 应校验所有支持的水印位置

#### 1.7 extractInfo

- ✅ 应校验 ImageInfo 接口结构
- ✅ 文件不存在时应抛出错误

#### 1.8 清理

- ✅ @dreamer/test cleanup browsers（Deno 下跳过）

### 2. 图片客户端 - 浏览器 (client-browser.test.ts) - 10 项

#### 2.1 加载与 API 存在性

- ✅ 应加载 ImageClient 并暴露
  resize/crop/convert/compress/extractInfo/addWatermark

#### 2.2 浏览器内操作

- ✅ 应在浏览器中完成 resize
- ✅ 应在浏览器中完成 crop
- ✅ 应在浏览器中完成 convert
- ✅ 应在浏览器中完成 compress
- ✅ 应在浏览器中完成 extractInfo
- ✅ 应在浏览器中完成 addWatermark（文字）

#### 2.3 清理

- ✅ @dreamer/test cleanup browsers（Deno 下跳过）

### 3. 图片实际操作 - ImageMagick (image-operations.test.ts) - 14 项

#### 3.1 可用性

- ✅ 应检查 ImageMagick 是否可用

#### 3.2 extractInfo

- ✅ 应从文件获取图片信息
- ✅ 应从 Uint8Array 获取图片信息

#### 3.3 resize

- ✅ 应缩放图片（指定宽高）
- ✅ 应缩放图片（仅指定宽度，保持比例）

#### 3.4 crop

- ✅ 应裁剪图片

#### 3.5 convert

- ✅ 应将图片转换为 PNG
- ✅ 应将图片转换为 WebP

#### 3.6 compress

- ✅ 应压缩图片（中等质量）
- ✅ 应压缩图片（低质量）

#### 3.7 addWatermark

- ✅ 应添加文字水印
- ✅ 应添加图片水印（临时文件缺失时可能告警）

#### 3.8 收尾

- ✅ 测试完成，输出保留在 tests/output

### 4. 图片客户端 - Mock (client-mock.test.ts) - 16 项

#### 4.1 resize

- ✅ 应缩放图片
- ✅ 应支持仅指定宽度
- ✅ 应支持仅指定高度

#### 4.2 crop

- ✅ 应裁剪图片

#### 4.3 convert

- ✅ 应转换为 JPEG
- ✅ 应转换为 WebP
- ✅ 应转换为 PNG

#### 4.4 compress

- ✅ 应压缩图片
- ✅ 应支持默认格式压缩

#### 4.5 addWatermark

- ✅ 应添加文字水印
- ✅ 应添加图片水印
- ✅ 应支持所有水印位置

#### 4.6 extractInfo

- ✅ 应提取图片信息
- ✅ 应从字符串 URL 提取图片信息

#### 4.7 清理

- ✅ @dreamer/test cleanup browsers（Deno 下跳过）

### 5. 图片客户端 - 选项校验 (client.test.ts) - 8 项

#### 5.1 resize

- ✅ 应校验选项参数

#### 5.2 crop

- ✅ 应校验选项参数

#### 5.3 convert

- ✅ 应校验所有支持的格式

#### 5.4 compress

- ✅ 应校验选项参数

#### 5.5 addWatermark

- ✅ 应校验文字水印选项

#### 5.6 extractInfo

- ✅ 应校验 ImageInfo 接口结构

#### 5.7 清理

- ✅ @dreamer/test cleanup browsers（Deno 下跳过）

## 测试覆盖分析

### 接口方法覆盖

| API                  | 服务端 (mod) | 客户端 (浏览器) | 客户端 (mock) | 客户端 (选项) | 实际操作 |
| -------------------- | ------------ | --------------- | ------------- | ------------- | -------- |
| resize               | ✅           | ✅              | ✅            | ✅            | ✅       |
| crop                 | ✅           | ✅              | ✅            | ✅            | ✅       |
| convert              | ✅           | ✅              | ✅            | ✅            | ✅       |
| compress             | ✅           | ✅              | ✅            | ✅            | ✅       |
| addWatermark         | ✅           | ✅              | ✅            | ✅            | ✅       |
| extractInfo          | ✅           | ✅              | ✅            | ✅            | ✅       |
| createImageProcessor | ✅           | —               | —             | —             | —        |

### 边界与错误

- ✅ 文件不存在：服务端 resize、extractInfo 抛出错误
- ✅ 非法选项：服务端与客户端校验格式、质量、水印选项
- ✅ ImageMagick 不可用：createImageProcessor 抛出；实际操作测试跳过或告警
- ✅ 浏览器：客户端 API 在真实 Chrome 中通过 Playwright 执行

## 必需服务

| 服务                    | 用途                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| ImageMagick（`magick`） | 服务端与实际操作测试（resize、crop、convert、compress、addWatermark、extractInfo） |
| Playwright / Chromium   | 浏览器客户端测试；需先执行 `npx playwright install chromium`                       |

## 优点

1. **双运行时**：Deno 与 Bun 下均 60 例通过。
2. **分层覆盖**：服务端校验、客户端校验、客户端 mock、真实浏览器客户端、实际
   ImageMagick 操作均有覆盖。
3. **失败路径清晰**：选项校验与文件缺失等错误均有测试。
4. **浏览器覆盖**：客户端在真实浏览器中测试，无 mock。
5. **降级友好**：ImageMagick
   或图片水印临时文件缺失时，操作测试会跳过或告警而不导致失败。

## 结论

`@dreamer/image` 在 5 个文件中共 64 个测试用例，每次运行 60 例通过（4 例为 Deno
下跳过的 cleanup）。结果表明：

1. ✅ **服务端 API**：选项校验与错误处理符合预期。
2. ✅ **客户端 API**：选项校验、mock 行为与真实浏览器行为均被验证。
3. ✅ **实际操作**：在 ImageMagick
   可用时，resize、crop、convert、compress、addWatermark、extractInfo 均被覆盖。
4. ✅ **兼容性**：Deno 与 Bun 下测试均通过。
5. ✅
   **稳定**：无失败用例；可选依赖（ImageMagick、Chromium）在文档中说明并在缺失时妥善处理。

在满足文档所述环境与依赖的前提下，该包可用于生产。

---

**报告生成日期**：2026-02-18\
**执行方式**：`deno test -A tests` → 60 通过、4 忽略（约 23s）；`bun test tests`
→ 60 通过（约 22s）。
