import type { Locale } from './locale.ts';
import { en, type TranslationKey } from './locales/en.ts';
import { id } from './locales/id.ts';

/** Flat translation dictionary — keep keys stable; add both locales together. */
export type { TranslationKey };

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en: en as Record<TranslationKey, string>,
  id,
};

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let text = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export { en, id };
