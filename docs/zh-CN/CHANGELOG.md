# 变更日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
