import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

const CURRENT_YEAR = new Date().getFullYear();

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-12 text-sm text-neutral-600 dark:text-neutral-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                MT
              </div>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                {t('brand.name')}
              </span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs max-w-sm leading-relaxed">
              {t('footer.blurb')}
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 pt-2">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />{' '}
                {t('footer.storedLocally')}
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />{' '}
                {t('footer.noAccount')}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />{' '}
                {t('footer.zeroTelemetry')}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-xs uppercase tracking-wider">
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/app"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {t('footer.openApp')}
                </Link>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {t('footer.docs')}
                </Link>
              </li>
              <li>
                <a
                  href="/#features"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {t('footer.productFeatures')}
                </a>
              </li>
              <li>
                <a
                  href="/#privacy"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {t('footer.privacyArch')}
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  {t('footer.howItWorks')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 text-xs uppercase tracking-wider">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('footer.clientSide')}
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('footer.indexedDb')}
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('footer.zeroCloud')}
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('footer.portability')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 dark:text-neutral-500">
          <p>{t('footer.copyright', { year: CURRENT_YEAR })}</p>
          <p>{t('footer.designed')}</p>
        </div>
      </div>
    </footer>
  );
}
