import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePwaInstallContext } from './PwaInstallProvider.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

type PWAInstallButtonProps = {
  /** `floating` = desktop FAB; `navbar` = compact control in the mobile header */
  variant?: 'floating' | 'navbar';
};

/**
 * PWA install CTA. Renders only when the browser exposes a deferred
 * `beforeinstallprompt` and the app is not already installed / standalone.
 */
export function PWAInstallButton({ variant = 'floating' }: PWAInstallButtonProps) {
  const { t } = useLanguage();
  const { canInstall, install } = usePwaInstallContext();
  const [busy, setBusy] = useState(false);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await install();
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'navbar') {
    return (
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        aria-label={t('pwa.addToHomeScreen')}
        title={t('pwa.addToHomeScreen')}
        className={[
          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
          'text-xs font-semibold',
          'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900',
          'hover:bg-neutral-800 dark:hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
          'disabled:opacity-60 disabled:pointer-events-none',
          'transition-colors',
        ].join(' ')}
      >
        <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{t('pwa.addToHomeScreenShort')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={busy}
      aria-label={t('pwa.addToHomeScreen')}
      className={[
        'hidden md:flex fixed z-50 items-center gap-2 rounded-full',
        'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900',
        'shadow-lg hover:bg-neutral-800 dark:hover:bg-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950',
        'disabled:opacity-60 disabled:pointer-events-none',
        'transition-all active:scale-[0.98]',
        'right-6 bottom-6',
        'px-4 py-3 text-sm font-semibold',
      ].join(' ')}
    >
      <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{t('pwa.addToHomeScreen')}</span>
    </button>
  );
}
