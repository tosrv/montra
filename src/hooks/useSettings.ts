import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/database.ts';
import type { AppSettings } from '../types.ts';

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
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateCurrency = async (newCurrency: string) => {
    const updated = { ...settings, currency: newCurrency };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const updateTheme = async (newTheme: 'system' | 'light' | 'dark') => {
    const updated = { ...settings, theme: newTheme };
    await db.settings.put(updated);
    setSettings(updated);
  };

  return {
    settings,
    loading,
    refreshSettings: loadSettings,
    updateCurrency,
    updateTheme,
  };
}
