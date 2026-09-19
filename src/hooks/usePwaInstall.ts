import { useCallback, useEffect, useState } from 'react';

const DISMISS_KEY = 'money_tracker_pwa_install_dismissed';

/** Chromium `beforeinstallprompt` event shape. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const mediaMinimal = window.matchMedia('(display-mode: minimal-ui)').matches;
  const iosStandalone =
    'standalone' in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return mediaStandalone || mediaMinimal || iosStandalone;
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Captures the browser install prompt and exposes a safe install() action.
 * The floating CTA should only render when `canInstall` is true.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [standalone, setStandalone] = useState(() => isStandaloneDisplay());

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    if (isStandaloneDisplay()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (wasDismissed()) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !installed && !standalone;

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    const promptEvent = deferredPrompt;
    setDeferredPrompt(null);

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'dismissed') {
      markDismissed();
    }
  }, [deferredPrompt]);

  return { canInstall, install };
}
