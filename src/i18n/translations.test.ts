import { describe, expect, it } from 'vitest';
import { translate } from './translations.ts';

describe('translate', () => {
  it('returns English and Indonesian strings for the same key', () => {
    expect(translate('en', 'nav.startTracking')).toBe('Start Tracking');
    expect(translate('id', 'nav.startTracking')).toBe('Mulai Catat');
  });

  it('interpolates variables', () => {
    expect(translate('en', 'footer.copyright', { year: 2026 })).toContain('2026');
    expect(translate('id', 'settings.restoreFailed', { message: 'oops' })).toContain('oops');
  });
});
