import { describe, expect, it } from 'vitest';
import { computeAccountBalance } from './balance.ts';
import type { Transaction } from '../types.ts';

const baseTx = {
  description: '',
  date: '2026-09-01',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
} as const;

describe('computeAccountBalance', () => {
  it('starts from initial balance with no transactions', () => {
    const result = computeAccountBalance({ id: 1, initialBalance: 100_000 }, []);
    expect(result.currentBalance).toBe(100_000);
    expect(result.transactionCount).toBe(0);
  });

  it('applies income and expense', () => {
    const transactions: Transaction[] = [
      { ...baseTx, id: 1, type: 'income', amount: 50_000, accountId: 1 },
      { ...baseTx, id: 2, type: 'expense', amount: 20_000, accountId: 1 },
    ];
    const result = computeAccountBalance({ id: 1, initialBalance: 10_000 }, transactions);
    expect(result.incomeTotal).toBe(50_000);
    expect(result.expenseTotal).toBe(20_000);
    expect(result.currentBalance).toBe(40_000);
    expect(result.transactionCount).toBe(2);
  });

  it('applies transfers in and out', () => {
    const transactions: Transaction[] = [
      {
        ...baseTx,
        id: 1,
        type: 'transfer',
        amount: 15_000,
        accountId: 1,
        destinationAccountId: 2,
      },
      {
        ...baseTx,
        id: 2,
        type: 'transfer',
        amount: 5_000,
        accountId: 3,
        destinationAccountId: 1,
      },
    ];
    const result = computeAccountBalance({ id: 1, initialBalance: 0 }, transactions);
    expect(result.transferOutTotal).toBe(15_000);
    expect(result.transferInTotal).toBe(5_000);
    expect(result.currentBalance).toBe(-10_000);
    expect(result.transactionCount).toBe(2);
  });

  it('ignores transactions for other accounts', () => {
    const transactions: Transaction[] = [
      { ...baseTx, id: 1, type: 'expense', amount: 9_999, accountId: 2 },
    ];
    const result = computeAccountBalance({ id: 1, initialBalance: 1_000 }, transactions);
    expect(result.currentBalance).toBe(1_000);
    expect(result.transactionCount).toBe(0);
  });
});
