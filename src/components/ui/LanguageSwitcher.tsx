import React from 'react';
import { LOCALES, type Locale } from '../../i18n/locale.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

interface LanguageSwitcherProps {
  /** compact = EN | ID pills for navbar; full = labeled buttons for settings */
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'compact', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();

  if (variant === 'full') {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('nav.language')}>
          {LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => void setLocale(item.code)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                locale === item.code
                  ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                  : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {item.short} · {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 bg-neutral-50 dark:bg-neutral-900 ${className}`}
      role="group"
      aria-label={t('nav.language')}
    >
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => void setLocale(item.code as Locale)}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
            locale === item.code
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}
