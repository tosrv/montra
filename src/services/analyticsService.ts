const DEFAULT_UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';

/**
 * Legacy local-telemetry keys — cleared once so old Settings data does not linger.
 */
const LEGACY_KEYS = [
  'money_tracker_installation_id',
  'money_tracker_analytics_enabled',
  'money_tracker_visit_stats',
  'money_tracker_analytics_logs',
] as const;

function getUmamiConfig(): { websiteId: string; scriptUrl: string } | null {
  const websiteId = String(import.meta.env.VITE_UMAMI_WEBSITE_ID ?? '').trim();
  if (!websiteId) return null;
  const scriptUrl =
    String(import.meta.env.VITE_UMAMI_SCRIPT_URL ?? '').trim() || DEFAULT_UMAMI_SCRIPT_URL;
  return { websiteId, scriptUrl };
}

export function isUmamiConfigured(): boolean {
  return getUmamiConfig() !== null;
}

let umamiLoadPromise: Promise<void> | null = null;
let sessionInitialized = false;

function clearLegacyLocalTelemetry(): void {
  try {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

/**
 * Injects Umami Cloud script when VITE_UMAMI_WEBSITE_ID is set.
 * Only anonymous pageviews — no financial data, no in-app telemetry UI.
 */
function ensureUmamiLoaded(): Promise<void> {
  const config = getUmamiConfig();
  if (!config || typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.querySelector(`script[data-website-id="${config.websiteId}"]`)) {
    return Promise.resolve();
  }

  if (umamiLoadPromise) {
    return umamiLoadPromise;
  }

  umamiLoadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.defer = true;
    script.src = config.scriptUrl;
    script.dataset.websiteId = config.websiteId;
    script.onload = () => resolve();
    script.onerror = () => {
      umamiLoadPromise = null;
      resolve();
    };
    document.head.appendChild(script);
  });

  return umamiLoadPromise;
}

/**
 * Call once per page load from App.
 */
export function initializeAnalytics(): void {
  if (sessionInitialized) return;
  sessionInitialized = true;

  clearLegacyLocalTelemetry();

  if (!isUmamiConfigured()) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] Umami not configured (set VITE_UMAMI_WEBSITE_ID to enable).');
    }
    return;
  }

  void ensureUmamiLoaded().then(() => {
    if (import.meta.env.DEV) {
      console.info('[Analytics] Umami script loaded');
    }
  });
}
