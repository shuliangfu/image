/**
 * 浏览器测试入口：将 @dreamer/image 客户端 API 挂到 window，供 evaluate 调用
 * 打包为 IIFE 时使用 globalName "ImageClient"
 */
export {
  addWatermark,
  compress,
  convert,
  crop,
  extractInfo,
  resize,
} from "../../src/client/mod.ts";
