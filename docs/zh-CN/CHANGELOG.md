# 变更日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.1.1] - 2026-11-20

### 修复

- **GIF / 多帧转换：** ImageMagick 将多帧输入（如动画
  GIF）转为单帧格式时，会写成 `name-0.ext` 而不是期望的
  `name.ext`。`readAndCleanup` 现在会回退读取第一帧， 并清理所有帧文件，避免
  `convert` 因找不到输出文件而失败。
- **macOS CI 上的 Node 测试：** `test:node` 增加
  `--experimental-test-isolation=none`，避免 `node:test` worker IPC 偶发 "Unable
  to deserialize cloned data due to invalid or unsupported version" 失败。

### 变更

- **CI：** Linux job 固定为 `ubuntu-24.04`，以保证 Playwright Chromium 能稳定
  安装并运行。

---

## [1.1.0] - 2026-07-23

### 新增

- **Node.js 兼容**：image 现可在 Node.js 22+ 上运行，与 Deno、Bun 三端共用。
  所有文件系统、环境与进程操作均经 `@dreamer/runtime-adapter`（v1.2.2，已支持
  Node）。**无需修改 `src/`**——`getOS()` 已通过 `process.platform` else 分支支持
  Bun/Node，ImageMagick 调用使用跨运行时 `createCommand().output()` API。
- **Node 测试基础设施**：`package.json` 含 `test:node` 脚本
  （`tsx --tsconfig tsconfig.json --test --test-force-exit tests/mod.test.ts
  tests/image-operations.test.ts`）、`tsconfig.json`。浏览器测试
  （`client-browser.test.ts`、`client.test.ts`、`client-mock.test.ts`）在 Node CI
  中排除（需 Chromium + @dreamer/esbuild）。`image-operations.test.ts` 在未安装
  ImageMagick 时自动跳过（`checkImageMagickAvailable()`）。
- **CI 工作流**新建（9 个 job — 3 Deno v2.9 + 3 Bun + 3 Node 22）。Deno/Bun job
  安装 Playwright Chromium 1.59.1 并运行全部测试（含浏览器）；Windows Bun 仅跑
  服务端测试（避开 chromium hang bug，oven-sh/bun#15679）；Node job 运行
  `test:node`（不安装 Chromium）。
- `deno.json` 添加 `minimumDependencyAge: 0` 与 `nodeModulesDir: "auto"`，以兼容
  当日发布的 `@dreamer/*` 依赖。

### 变更

- 依赖升级：`@dreamer/i18n` ^1.1.2、`@dreamer/test` ^1.2.3、
  `@dreamer/runtime-adapter` ^1.2.2。
- `publish.yml` 使用 `npx jsr publish`（发布时类型检查）。

### 文档

- 中英文测试报告更新为三端结果：Deno 60（4 忽略）、Bun 58、Node 28。

---

## [1.0.2] - 2026-02-19

### 变更

- **i18n**：初始化改为在加载 i18n 模块时自动执行。入口文件不再导入或调用
  `initImageI18n`；请从你的代码中移除相关用法。

---

## [1.0.1] - 2026-02-19

### 变更

- **i18n**：翻译方法由 `$t` 重命名为 `$tr`，避免与全局 `$t`
  冲突。请将现有代码中本包消息改为使用 `$tr`。

---

## [1.0.0] - 2026-02-18

### 新增

- **稳定版 1.0.0**：面向 Deno 与 Bun 的图片处理库。
- **服务端（ImageMagick）**：`resize`、`crop`、`convert`、`compress`、`addWatermark`、`extractInfo`；支持文件路径或缓冲区输入；质量
  0–100；多种适配模式（contain、cover、fill、inside、outside）；批量处理；`createImageProcessor`
  可配置 magickPath、tempDir、autoInstall。
- **客户端（Canvas API）**：通过 `jsr:@dreamer/image/client` 提供相同 API；质量
  0–1；返回 `Blob`；无额外依赖。
- **格式**：JPEG、PNG、WebP、GIF、BMP、TIFF、AVIF（输入/输出）。
- **压缩**：有损（`quality < 100`）与无损（`quality = 100`）；按格式默认（如
  PNG/GIF 100，JPEG/WebP/AVIF 80）。
- **水印**：文字与图片水印；位置（四角、居中）；透明度。
- **文档**：仓库根目录为完整英文 README；中文文档位于
  `docs/zh-CN/`（README、CHANGELOG、TEST_REPORT、客户端 README）；`docs/en-US/`
  提供 CHANGELOG、TEST_REPORT 及客户端 README。
- **服务端 i18n**：安装提示、控制台输出与错误信息统一通过 `./i18n.ts` 的 `$t()`
  输出，提供 en-US / zh-CN 语言包；支持 `createImageProcessor({ lang })` 与
  `initImageI18n()` / `setImageLocale()` 设置语言；便于识别 `$t` 的 i18n
  插件使用。

### 说明

- 服务端需安装 ImageMagick 命令行工具；macOS
  可自动检测并尝试安装。示例与测试中的文件、路径操作使用
  `@dreamer/runtime-adapter`。
