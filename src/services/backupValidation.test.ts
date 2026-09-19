import { describe, expect, it } from 'vitest';
import { validateBackupData } from './backupValidation.ts';

const validBackup = {
  schemaVersion: 1,
  accounts: [{ id: 1, name: 'BCA', type: 'bank', initialBalance: 0 }],
  categories: [{ id: 10, name: 'Food', type: 'expense', icon: 'Utensils' }],
  transactions: [
    {
      id: 100,
      type: 'expense',
      amount: 25000,
      accountId: 1,
      categoryId: 10,
      description: 'Lunch',
      date: '2026-09-19',
    },
  ],
};

describe('validateBackupData', () => {
  it('accepts a well-formed backup', () => {
    const result = validateBackupData(validBackup);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stats).toEqual({
      accountsCount: 1,
      categoriesCount: 1,
      transactionsCount: 1,
    });
  });

  it('rejects non-object payloads', () => {
    const result = validateBackupData(null);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toMatch(/valid JSON object/i);
  });

  it('rejects missing arrays', () => {
    const result = validateBackupData({ accounts: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('categories'))).toBe(true);
    expect(result.errors.some((e) => e.includes('transactions'))).toBe(true);
  });

  it('rejects invalid transaction amounts', () => {
    const result = validateBackupData({
      ...validBackup,
      transactions: [{ ...validBackup.transactions[0], amount: 0 }],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('invalid amount'))).toBe(true);
  });

  it('rejects transfer without destination or same-account transfer', () => {
    const missingDest = validateBackupData({
      ...validBackup,
      transactions: [
        {
          type: 'transfer',
          amount: 1000,
          accountId: 1,
          date: '2026-09-19',
        },
      ],
    });
    expect(missingDest.isValid).toBe(false);

    const sameAccount = validateBackupData({
      ...validBackup,
      accounts: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ],
      transactions: [
        {
          type: 'transfer',
          amount: 1000,
          accountId: 1,
          destinationAccountId: 1,
          date: '2026-09-19',
        },
      ],
    });
    expect(sameAccount.isValid).toBe(false);
    expect(sameAccount.errors.some((e) => e.includes('identical'))).toBe(true);
  });

  it('warns on orphan account references', () => {
    const result = validateBackupData({
      ...validBackup,
      transactions: [{ ...validBackup.transactions[0], accountId: 999 }],
    });
    expect(result.isValid).toBe(true);
    expect(result.warnings.some((w) => w.includes('account ID 999'))).toBe(true);
  });

  it('rejects duplicate account IDs', () => {
    const result = validateBackupData({
      ...validBackup,
      accounts: [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
      ],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate account ID'))).toBe(true);
  });
});
