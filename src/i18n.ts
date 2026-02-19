/**
 * @module @dreamer/image/i18n
 *
 * Server-side i18n for @dreamer/image: install hints, console messages,
 * and error messages. No global; use import $tr. When lang is not passed,
 * locale is auto-detected from env (LANGUAGE / LC_ALL / LANG).
 */

import {
  createI18n,
  type I18n,
  type TranslationData,
  type TranslationParams,
} from "@dreamer/i18n";
import { getEnv } from "@dreamer/runtime-adapter";
import enUS from "./locales/en-US.json" with { type: "json" };
import zhCN from "./locales/zh-CN.json" with { type: "json" };

/** Supported locale for server messages. */
export type Locale = "en-US" | "zh-CN";

/** Default locale when detection fails. */
export const DEFAULT_LOCALE: Locale = "en-US";

const IMAGE_LOCALES: Locale[] = ["en-US", "zh-CN"];

const LOCALE_DATA: Record<string, TranslationData> = {
  "en-US": enUS as TranslationData,
  "zh-CN": zhCN as TranslationData,
};

/** init 时创建的实例，不挂全局 */
let imageI18n: I18n | null = null;

/**
 * Detect locale from env: LANGUAGE > LC_ALL > LANG.
 */
export function detectLocale(): Locale {
  const langEnv = getEnv("LANGUAGE") || getEnv("LC_ALL") || getEnv("LANG");
  if (!langEnv) return DEFAULT_LOCALE;
  const first = langEnv.split(/[:\s]/)[0]?.trim();
  if (!first) return DEFAULT_LOCALE;
  const match = first.match(/^([a-z]{2})[-_]([A-Z]{2})/i);
  if (match) {
    const normalized = `${match[1].toLowerCase()}-${
      match[2].toUpperCase()
    }` as Locale;
    if (IMAGE_LOCALES.includes(normalized)) return normalized;
  }
  const primary = first.substring(0, 2).toLowerCase();
  if (primary === "zh") return "zh-CN";
  if (primary === "en") return "en-US";
  return DEFAULT_LOCALE;
}

/**
 * Load translations and set current locale. Call once before first server use.
 */
export function initImageI18n(): void {
  if (imageI18n) return;
  const i18n = createI18n({
    defaultLocale: DEFAULT_LOCALE,
    fallbackBehavior: "default",
    locales: [...IMAGE_LOCALES],
    translations: LOCALE_DATA as Record<string, TranslationData>,
  });
  i18n.setLocale(detectLocale());
  imageI18n = i18n;
}

/**
 * Set current locale for image messages (e.g. from createImageProcessor({ lang })).
 */
export function setImageLocale(lang: Locale): void {
  initImageI18n();
  if (imageI18n) imageI18n.setLocale(lang);
}

/**
 * 框架专用翻译。未传 lang 时使用当前 locale。
 */
export function $tr(
  key: string,
  params?: TranslationParams,
  lang?: Locale,
): string {
  if (!imageI18n) initImageI18n();
  if (!imageI18n) return key;
  if (lang !== undefined) {
    const prev = imageI18n.getLocale();
    imageI18n.setLocale(lang);
    try {
      return imageI18n.t(key, params);
    } finally {
      imageI18n.setLocale(prev);
    }
  }
  return imageI18n.t(key, params);
}
