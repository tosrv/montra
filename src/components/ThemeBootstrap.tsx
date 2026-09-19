import { useEffect } from 'react';
import { initializeDatabase, db } from '../db/database.ts';
import { applyTheme, subscribeSystemTheme, getStoredThemePreference } from '../utils/theme.ts';

/**
 * Applies saved theme on every route (including landing) and keeps system mode in sync.
 */
export function ThemeBootstrap() {
  useEffect(() => {
    applyTheme(getStoredThemePreference());

    async function syncFromDb() {
      try {
        await initializeDatabase();
        const existing = await db.settings.get('default');
        applyTheme(existing?.theme ?? getStoredThemePreference());
      } catch {
        applyTheme(getStoredThemePreference());
      }
    }

    void syncFromDb();

    // On OS theme change, re-resolve only matters when preference is 'system'
    return subscribeSystemTheme(() => applyTheme(getStoredThemePreference()));
  }, []);

  return null;
}
