import type { AnalyticsEvent, AnalyticsEventName } from '../types.ts';

const INSTALLATION_ID_KEY = 'money_tracker_installation_id';
const ANALYTICS_ENABLED_KEY = 'money_tracker_analytics_enabled';
const ANALYTICS_LOG_KEY = 'money_tracker_analytics_logs';
const APP_VERSION = '1.0.0';

/**
 * Generates a simple RFC4122 v4 UUID without external dependencies
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates the anonymous installation ID.
 */
export function getAnonymousInstallationId(): { id: string; isNew: boolean } {
  try {
    const existing = localStorage.getItem(INSTALLATION_ID_KEY);
    if (existing) {
      return { id: existing, isNew: false };
    }
    const newId = generateUUID();
    localStorage.setItem(INSTALLATION_ID_KEY, newId);
    return { id: newId, isNew: true };
  } catch {
    return { id: 'anonymous-session-' + Date.now(), isNew: true };
  }
}

/**
 * Check if analytics is enabled by user preference (default true, can be toggled in settings)
 */
export function isAnalyticsEnabled(): boolean {
  try {
    const val = localStorage.getItem(ANALYTICS_ENABLED_KEY);
    return val !== 'false';
  } catch {
    return true;
  }
}

export function setAnalyticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ANALYTICS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Retrieves the local audit log of dispatched anonymous events (for user transparency)
 */
export function getLocalAnalyticsLog(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendToLocalLog(event: AnalyticsEvent): void {
  try {
    const current = getLocalAnalyticsLog();
    const updated = [event, ...current].slice(0, 30); // Keep last 30 for transparency review
    localStorage.setItem(ANALYTICS_LOG_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Core event tracking function.
 * Strictly guarantees that NO financial data can be passed.
 * The payload signature ONLY accepts safe event names.
 */
export function trackEvent(eventName: AnalyticsEventName): void {
  try {
    if (!isAnalyticsEnabled()) return;

    const { id } = getAnonymousInstallationId();
    const payload: AnalyticsEvent = {
      event_name: eventName,
      anonymous_installation_id: id,
      app_version: APP_VERSION,
      timestamp: new Date().toISOString(),
      platform: navigator.platform || 'web',
      browser_family: navigator.userAgent.includes('Chrome')
        ? 'Chrome/Blink'
        : navigator.userAgent.includes('Firefox')
        ? 'Firefox'
        : navigator.userAgent.includes('Safari')
        ? 'Safari'
        : 'Other',
    };

    // Append to local audit trail so user can inspect anytime in Settings
    appendToLocalLog(payload);

    // Optional safe dispatch to endpoint if configured, never throws, never blocks
    // In local-first mode, logged cleanly in dev console without spamming
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Anonymous Analytics Event]: ${eventName}`, {
        installation: payload.anonymous_installation_id,
        time: payload.timestamp,
      });
    }
  } catch (error) {
    // Analytics failures must NEVER break or affect application flow
    console.warn('Analytics event dispatch bypassed:', error);
  }
}

/**
 * Handles initialization event logic (first_visit vs app_opened)
 */
let sessionInitialized = false;

export function initializeAnonymousSession(): void {
  if (sessionInitialized) return;
  sessionInitialized = true;

  try {
    const { isNew } = getAnonymousInstallationId();
    if (isNew) {
      trackEvent('first_visit');
    } else {
      trackEvent('app_opened');
    }
  } catch {
    // silent failure safety
  }
}
