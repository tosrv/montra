export type Locale = 'en' | 'id';

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'id', label: 'Indonesia', short: 'ID' },
];

const LANGUAGE_STORAGE_KEY = 'money_tracker_language';

export function detectBrowserLocale(): Locale {
  try {
    const lang = navigator.language?.toLowerCase() ?? '';
    if (lang.startsWith('id')) return 'id';
  } catch {
    // ignore
  }
  return 'en';
}

export function getStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw === 'en' || raw === 'id') return raw;
  } catch {
    // ignore
  }
  return detectBrowserLocale();
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

export function applyDocumentLang(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}
