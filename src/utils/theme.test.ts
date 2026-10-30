import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, getStoredThemePreference, resolveTheme } from './theme.ts';

describe('resolveTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns light/dark for explicit preferences', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('resolves system from prefers-color-scheme', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
      }))
    );
    expect(resolveTheme('system')).toBe('dark');
  });
});

describe('applyTheme / getStoredThemePreference', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    vi.unstubAllGlobals();
  });

  it('persists preference and toggles dark class', () => {
    applyTheme('dark');
    expect(getStoredThemePreference()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');

    applyTheme('light');
    expect(getStoredThemePreference()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('defaults stored preference to system', () => {
    expect(getStoredThemePreference()).toBe('system');
  });
});
