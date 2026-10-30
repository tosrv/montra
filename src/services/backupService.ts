import { db, initializeDatabase } from '../db/database.ts';
import type { BackupData } from '../types.ts';
export type { ValidationResult } from './backupValidation.ts';
export { validateBackupData } from './backupValidation.ts';

/**
 * Generates a full JSON backup of the user's local database and initiates client-side download.
 */
export async function exportBackupJson(): Promise<void> {
  const transactions = await db.transactions.toArray();
  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();
  const budgets = await db.budgets.toArray();
  const budgetCategories = await db.budgetCategories.toArray();
  const settings = (await db.settings.get('default')) || {
    id: 'default',
    currency: 'IDR',
    theme: 'system',
    language: 'en' as const,
    schemaVersion: 1,
  };

  const backup: BackupData = {
    appName: 'MonTra',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    settings,
    accounts,
    categories,
    transactions,
    budgets,
    budgetCategories,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `montra-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Restores a validated backup into Dexie local database.
 */
export async function restoreBackupData(data: BackupData): Promise<void> {
  await db.transaction(
    'rw',
    [db.accounts, db.categories, db.transactions, db.settings, db.budgets, db.budgetCategories],
    async () => {
      await db.transactions.clear();
      await db.accounts.clear();
      await db.categories.clear();
      await db.budgets.clear();
      await db.budgetCategories.clear();

      if (data.accounts.length > 0) {
        await db.accounts.bulkAdd(data.accounts);
      }
      if (data.categories.length > 0) {
        await db.categories.bulkAdd(data.categories);
      }
      if (data.transactions.length > 0) {
        await db.transactions.bulkAdd(data.transactions);
      }
      if (data.budgets && data.budgets.length > 0) {
        await db.budgets.bulkAdd(data.budgets);
      }
      if (data.budgetCategories && data.budgetCategories.length > 0) {
        await db.budgetCategories.bulkAdd(data.budgetCategories);
      }
      if (data.settings) {
        await db.settings.put({
          ...data.settings,
          id: 'default',
        });
      }
    }
  );
}

/**
 * Exports all transactions to CSV entirely client-side.
 * Columns: Date, Type, Category, Account, Description, Amount
 */
export async function exportTransactionsCsv(): Promise<void> {
  const transactions = await db.transactions.orderBy('date').reverse().toArray();
  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();

  const accountMap = new Map(accounts.map((a) => [a.id!, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id!, c.name]));

  const headers = ['Date', 'Type', 'Category', 'Account', 'Description', 'Amount'];
  const rows = transactions.map((tx) => {
    let accountName = accountMap.get(tx.accountId) || 'Unknown Account';
    if (tx.type === 'transfer' && tx.destinationAccountId) {
      const destName = accountMap.get(tx.destinationAccountId) || 'Unknown Account';
      accountName = `${accountName} -> ${destName}`;
    }

    let catName = '-';
    if (tx.type !== 'transfer') {
      catName = tx.categoryId ? categoryMap.get(tx.categoryId) || 'Uncategorized' : 'None';
    }

    const cleanDesc = (tx.description || '').replace(/"/g, '""');
    return [
      `"${tx.date}"`,
      `"${tx.type}"`,
      `"${catName}"`,
      `"${accountName}"`,
      `"${cleanDesc}"`,
      tx.amount,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `montra-transactions-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Resets database back to default initial state (zeros only)
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction(
    'rw',
    [db.accounts, db.categories, db.transactions, db.settings, db.budgets, db.budgetCategories],
    async () => {
      await db.transactions.clear();
      await db.accounts.clear();
      await db.categories.clear();
      await db.settings.clear();
      await db.budgets.clear();
      await db.budgetCategories.clear();
    }
  );
  await initializeDatabase();
}
