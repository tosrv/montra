import { db, initializeDatabase } from '../db/database.ts';
import { trackEvent } from './analyticsService.ts';
import type { Account, AppSettings, BackupData, Category, Transaction } from '../types.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    accountsCount: number;
    categoriesCount: number;
    transactionsCount: number;
  };
}

/**
 * Generates a full JSON backup of the user's local database and initiates client-side download.
 */
export async function exportBackupJson(): Promise<void> {
  const transactions = await db.transactions.toArray();
  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();
  const settings = (await db.settings.get('default')) || {
    id: 'default',
    currency: 'IDR',
    theme: 'system',
    schemaVersion: 1,
  };

  const backup: BackupData = {
    appName: 'Money Tracker',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    settings,
    accounts,
    categories,
    transactions,
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `money-tracker-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  trackEvent('backup_exported');
}

/**
 * Validates a parsed JSON backup object against strict integrity rules.
 */
export function validateBackupData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['File does not contain a valid JSON object.'], warnings: [] };
  }

  if (data.schemaVersion && typeof data.schemaVersion !== 'number') {
    errors.push('Invalid schemaVersion format.');
  }

  if (!Array.isArray(data.accounts)) {
    errors.push('Missing or invalid "accounts" array.');
  }

  if (!Array.isArray(data.categories)) {
    errors.push('Missing or invalid "categories" array.');
  }

  if (!Array.isArray(data.transactions)) {
    errors.push('Missing or invalid "transactions" array.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Validate Accounts
  const accountIdSet = new Set<number>();
  for (let i = 0; i < data.accounts.length; i++) {
    const acc = data.accounts[i];
    if (!acc.name || typeof acc.name !== 'string') {
      errors.push(`Account at index ${i} is missing a valid name.`);
    }
    if (!acc.id && acc.id !== 0) {
      warnings.push(`Account "${acc.name || i}" has no ID and will receive a new one.`);
    } else {
      if (accountIdSet.has(acc.id)) {
        errors.push(`Duplicate account ID detected: ${acc.id}`);
      }
      accountIdSet.add(acc.id);
    }
  }

  // Validate Categories
  const categoryIdSet = new Set<number>();
  for (let i = 0; i < data.categories.length; i++) {
    const cat = data.categories[i];
    if (!cat.name || typeof cat.name !== 'string') {
      errors.push(`Category at index ${i} is missing a valid name.`);
    }
    if (!['income', 'expense'].includes(cat.type)) {
      errors.push(`Category "${cat.name || i}" has invalid type "${cat.type}".`);
    }
    if (cat.id !== undefined) {
      if (categoryIdSet.has(cat.id)) {
        errors.push(`Duplicate category ID detected: ${cat.id}`);
      }
      categoryIdSet.add(cat.id);
    }
  }

  // Validate Transactions
  for (let i = 0; i < data.transactions.length; i++) {
    const tx = data.transactions[i];
    if (!['income', 'expense', 'transfer'].includes(tx.type)) {
      errors.push(`Transaction at index ${i} has invalid type "${tx.type}".`);
    }
    if (typeof tx.amount !== 'number' || tx.amount <= 0 || isNaN(tx.amount)) {
      errors.push(`Transaction at index ${i} has invalid amount "${tx.amount}". Must be > 0.`);
    }
    if (!tx.date || typeof tx.date !== 'string') {
      errors.push(`Transaction at index ${i} is missing a valid date.`);
    }
    if (tx.accountId === undefined || !accountIdSet.has(tx.accountId)) {
      warnings.push(
        `Transaction at index ${i} references account ID ${tx.accountId} which is not in the accounts list.`
      );
    }
    if (tx.type === 'transfer') {
      if (!tx.destinationAccountId) {
        errors.push(`Transfer transaction at index ${i} is missing destinationAccountId.`);
      } else if (tx.destinationAccountId === tx.accountId) {
        errors.push(`Transfer transaction at index ${i} has identical source and destination account.`);
      } else if (!accountIdSet.has(tx.destinationAccountId)) {
        warnings.push(
          `Transfer transaction at index ${i} references destination account ID ${tx.destinationAccountId} which is not found.`
        );
      }
    } else if (tx.categoryId !== undefined && !categoryIdSet.has(tx.categoryId)) {
      warnings.push(
        `Transaction at index ${i} references category ID ${tx.categoryId} which is not found.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      accountsCount: data.accounts.length,
      categoriesCount: data.categories.length,
      transactionsCount: data.transactions.length,
    },
  };
}

/**
 * Restores a validated backup into Dexie local database.
 */
export async function restoreBackupData(data: BackupData): Promise<void> {
  await db.transaction('rw', [db.accounts, db.categories, db.transactions, db.settings], async () => {
    await db.transactions.clear();
    await db.accounts.clear();
    await db.categories.clear();

    if (data.accounts.length > 0) {
      await db.accounts.bulkAdd(data.accounts);
    }
    if (data.categories.length > 0) {
      await db.categories.bulkAdd(data.categories);
    }
    if (data.transactions.length > 0) {
      await db.transactions.bulkAdd(data.transactions);
    }
    if (data.settings) {
      await db.settings.put({
        ...data.settings,
        id: 'default',
      });
    }
  });

  trackEvent('backup_imported');
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
  link.download = `money-tracker-transactions-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  trackEvent('csv_exported');
}

/**
 * Resets database back to default initial state (zeros only)
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [db.accounts, db.categories, db.transactions, db.settings], async () => {
    await db.transactions.clear();
    await db.accounts.clear();
    await db.categories.clear();
    await db.settings.clear();
  });
  await initializeDatabase();
}
