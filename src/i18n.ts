/**
 * @module @dreamer/image/i18n
 *
 * Server-side i18n for @dreamer/image: install hints, console messages,
 * and error messages. When lang is not passed, locale is auto-detected from
 * env (LANGUAGE / LC_ALL / LANG). Client code is not translated.
 */

import {
  $i18n,
  getGlobalI18n,
  getI18n,
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

let imageTranslationsLoaded = false;

/**
 * Detect locale from env: LANGUAGE > LC_ALL > LANG.
 * Returns DEFAULT_LOCALE when unset or not in supported list.
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
 * Load image package translations into the current I18n instance (once).
 */
export function ensureImageI18n(): void {
  if (imageTranslationsLoaded) return;
  const i18n = getGlobalI18n() ?? getI18n();
  i18n.loadTranslations("en-US", enUS as TranslationData);
  i18n.loadTranslations("zh-CN", zhCN as TranslationData);
  imageTranslationsLoaded = true;
}

/**
 * Load translations and set current locale. Call once before first server use.
 */
export function initImageI18n(): void {
  ensureImageI18n();
  $i18n.setLocale(detectLocale());
}

/**
 * Set current locale for image messages (e.g. from createImageProcessor({ lang })).
 */
export function setImageLocale(lang: Locale): void {
  ensureImageI18n();
  $i18n.setLocale(lang);
}
/**
 * 按 key 翻译。未传 lang 时使用当前 locale（在 initImageI18n / setImageLocale 中已设置）。
 */
export function $t(
  key: string,
  params?: TranslationParams,
  lang?: Locale,
): string {
  if (lang !== undefined) {
    const prev = $i18n.getLocale();
    $i18n.setLocale(lang);
    try {
      return $i18n.t(key, params);
    } finally {
      $i18n.setLocale(prev);
    }
  }
  return $i18n.t(key, params);
}
