import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

export function PublicNavbar() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-neutral-800 dark:group-hover:bg-white transition-colors">
            <span className="tracking-tighter">MT</span>
          </div>
          <div>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-lg tracking-tight">
              {t('brand.name')}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              {t('brand.localFirst')}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="/#features"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t('nav.features')}
          </a>
          <a
            href="/#privacy"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t('nav.privacy')}
          </a>
          <a
            href="/#how-it-works"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t('nav.howItWorks')}
          </a>
          <a
            href="/#backup"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t('nav.backup')}
          </a>
          <Link
            to="/docs"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {t('nav.docs')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/docs"
            className="lg:hidden text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors px-1"
          >
            {t('nav.docs')}
          </Link>
          <LanguageSwitcher variant="compact" />
          <Link
            id="navbar-start-tracking-cta"
            to="/app"
            className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-xs transition-all"
          >
            <span>{t('nav.startTracking')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
