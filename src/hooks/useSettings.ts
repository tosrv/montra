import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database.ts';
import type { AppSettings } from '../types.ts';
import {
  applyTheme,
  subscribeSystemTheme,
  type ThemePreference,
} from '../utils/theme.ts';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    id: 'default',
    currency: 'IDR',
    theme: 'system',
    schemaVersion: 1,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const existing = await db.settings.get('default');
      if (existing) {
        setSettings(existing);
        applyTheme(existing.theme);
      } else {
        applyTheme('system');
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      applyTheme('system');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Re-apply when OS preference changes while theme === 'system'
  useEffect(() => {
    if (settings.theme !== 'system') return;
    return subscribeSystemTheme(() => applyTheme('system'));
  }, [settings.theme]);

  const updateCurrency = async (newCurrency: string) => {
    const updated = { ...settings, currency: newCurrency };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const updateTheme = async (newTheme: ThemePreference) => {
    const updated = { ...settings, theme: newTheme };
    await db.settings.put(updated);
    setSettings(updated);
    applyTheme(newTheme);
  };

  return {
    settings,
    loading,
    refreshSettings: loadSettings,
    updateCurrency,
    updateTheme,
  };
}
