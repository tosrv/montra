import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database.ts';
import { generateDemoData, loadDemoData } from './demoDataService.ts';
import { validateBackupData } from './backupValidation.ts';
import type { AppSettings } from '../types.ts';

const settings: AppSettings = {
  id: 'default',
  currency: 'IDR',
  theme: 'dark',
  language: 'id',
  schemaVersion: 1,
};
const today = new Date(2026, 9, 15); // 15 Oct 2026

describe('generateDemoData', () => {
  it('produces a backup that passes validation', () => {
    const result = validateBackupData(generateDemoData(settings, today));
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('covers six months and never dates transactions after today', () => {
    const { transactions } = generateDemoData(settings, today);
    const months = new Set(transactions.map((tx) => tx.date.slice(0, 7)));
    expect([...months].sort()).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ]);
    expect(transactions.every((tx) => tx.date <= '2026-10-15')).toBe(true);
  });

  it('is deterministic', () => {
    expect(generateDemoData(settings, today)).toEqual(generateDemoData(settings, today));
  });

  it('creates budgets for the previous and current month', () => {
    const { budgets } = generateDemoData(settings, today);
    expect(budgets?.map((b) => [b.year, b.month])).toEqual([
      [2026, 8],
      [2026, 9],
    ]);
  });
});

describe('loadDemoData', () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });

  it('replaces data while keeping existing preferences', async () => {
    await db.settings.put({ ...settings, theme: 'light', currency: 'USD' });
    await loadDemoData();

    expect(await db.transactions.count()).toBeGreaterThan(100);
    expect(await db.accounts.count()).toBe(4);
    const saved = await db.settings.get('default');
    expect(saved?.theme).toBe('light');
    expect(saved?.currency).toBe('USD');
  });
});
