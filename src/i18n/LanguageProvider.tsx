import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyDocumentLang, getStoredLocale, setStoredLocale, type Locale } from './locale.ts';
import { translate, type TranslationKey } from './translations.ts';
import { db, initializeDatabase } from '../db/database.ts';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  useEffect(() => {
    applyDocumentLang(locale);

    async function syncFromDb() {
      try {
        await initializeDatabase();
        const settings = await db.settings.get('default');
        if (settings?.language === 'en' || settings?.language === 'id') {
          setLocaleState(settings.language);
          setStoredLocale(settings.language);
          applyDocumentLang(settings.language);
        } else if (settings) {
          const next = getStoredLocale();
          await db.settings.put({ ...settings, language: next });
        }
      } catch {
        // keep localStorage locale
      }
    }

    void syncFromDb();
    // Runs once on mount: syncs the stored locale with the DB.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    setStoredLocale(next);
    applyDocumentLang(next);
    try {
      await initializeDatabase();
      const settings = await db.settings.get('default');
      if (settings) {
        await db.settings.put({ ...settings, language: next });
      }
    } catch {
      // localStorage already updated
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
