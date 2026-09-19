import Dexie, { type Table } from 'dexie';
import type { Account, AppSettings, Category, Transaction } from '../types.ts';
import { getStoredLocale } from '../i18n/locale.ts';

export class MoneyTrackerDB extends Dexie {
  transactions!: Table<Transaction, number>;
  accounts!: Table<Account, number>;
  categories!: Table<Category, number>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('moneyTrackerDB');

    this.version(1).stores({
      transactions: '++id, date, type, accountId, categoryId, destinationAccountId, createdAt, updatedAt',
      accounts: '++id, name, type, initialBalance, createdAt, updatedAt',
      categories: '++id, name, type, icon, createdAt',
      settings: 'id, currency, theme, schemaVersion',
    });
  }
}

export const db = new MoneyTrackerDB();

/**
 * Ensures initial default data exists without creating any fake balances or transactions.
 */
export async function initializeDatabase(): Promise<void> {
  const now = new Date().toISOString();

  // 1. Settings initialization / language migration
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      currency: 'IDR',
      theme: 'system',
      language: getStoredLocale(),
      schemaVersion: 1,
    });
  } else {
    const existing = await db.settings.get('default');
    if (existing && existing.language !== 'en' && existing.language !== 'id') {
      await db.settings.put({
        ...existing,
        language: getStoredLocale(),
      });
    }
  }

  // 2. Default accounts initialization
  const accountsCount = await db.accounts.count();
  if (accountsCount === 0) {
    await db.accounts.bulkAdd([
      { name: 'BNI', type: 'bank', initialBalance: 0, createdAt: now, updatedAt: now },
      { name: 'Jago', type: 'bank', initialBalance: 0, createdAt: now, updatedAt: now },
      { name: 'BCA', type: 'bank', initialBalance: 0, createdAt: now, updatedAt: now },
      { name: 'Cash', type: 'cash', initialBalance: 0, createdAt: now, updatedAt: now },
    ]);
  }

  // 3. Default categories initialization
  const categoriesCount = await db.categories.count();
  if (categoriesCount === 0) {
    await db.categories.bulkAdd([
      { name: 'Salary', type: 'income', icon: 'Wallet', createdAt: now },
      { name: 'Freelance', type: 'income', icon: 'Briefcase', createdAt: now },
      { name: 'Business', type: 'income', icon: 'TrendingUp', createdAt: now },
      { name: 'Other', type: 'income', icon: 'CircleDot', createdAt: now },
      { name: 'Food', type: 'expense', icon: 'Utensils', createdAt: now },
      { name: 'Transport', type: 'expense', icon: 'Car', createdAt: now },
      { name: 'Bills', type: 'expense', icon: 'Receipt', createdAt: now },
      { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', createdAt: now },
      { name: 'Education', type: 'expense', icon: 'GraduationCap', createdAt: now },
      { name: 'Entertainment', type: 'expense', icon: 'Film', createdAt: now },
      { name: 'Health', type: 'expense', icon: 'HeartPulse', createdAt: now },
      { name: 'Other', type: 'expense', icon: 'CircleDot', createdAt: now },
    ]);
  }
}
