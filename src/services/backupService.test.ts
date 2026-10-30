import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database.ts';
import { resetDatabaseToDefaults, restoreBackupData } from './backupService.ts';
import type { BackupData } from '../types.ts';

const backup: BackupData = {
  appName: 'MonTra',
  schemaVersion: 2,
  exportedAt: '2026-09-30T00:00:00.000Z',
  settings: { id: 'default', currency: 'IDR', theme: 'dark', language: 'id', schemaVersion: 1 },
  accounts: [
    { id: 7, name: 'Jago', type: 'bank', initialBalance: 5000, createdAt: '', updatedAt: '' },
  ],
  categories: [{ id: 3, name: 'Food', type: 'expense', icon: 'Utensils', createdAt: '' }],
  transactions: [
    {
      id: 1,
      type: 'expense',
      amount: 1000,
      accountId: 7,
      categoryId: 3,
      description: 'Snack',
      date: '2026-09-02',
      createdAt: '',
      updatedAt: '',
    },
  ],
  budgets: [],
  budgetCategories: [],
};

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('restoreBackupData', () => {
  it('replaces existing data with the backup contents', async () => {
    await db.accounts.add({
      name: 'Old',
      type: 'cash',
      initialBalance: 0,
      createdAt: '',
      updatedAt: '',
    });

    await restoreBackupData(backup);

    expect((await db.accounts.toArray()).map((a) => a.name)).toEqual(['Jago']);
    expect(await db.transactions.get(1)).toMatchObject({ accountId: 7, categoryId: 3 });
    expect((await db.settings.get('default'))?.theme).toBe('dark');
  });
});

describe('resetDatabaseToDefaults', () => {
  it('clears user data and reseeds defaults', async () => {
    await restoreBackupData(backup);
    await resetDatabaseToDefaults();

    expect(await db.transactions.count()).toBe(0);
    expect(await db.accounts.count()).toBeGreaterThan(0);
    expect(await db.categories.count()).toBeGreaterThan(0);
  });
});
