import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database.ts';
import {
  createTransaction,
  deleteTransaction,
  getFilteredTransactions,
  getMonthlyDashboardSummary,
  updateTransaction,
} from './transactionService.ts';

let bca: number;
let cash: number;
let food: number;
let salary: number;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  const now = new Date().toISOString();
  bca = await db.accounts.add({
    name: 'BCA',
    type: 'bank',
    initialBalance: 100000,
    createdAt: now,
    updatedAt: now,
  });
  cash = await db.accounts.add({
    name: 'Cash',
    type: 'cash',
    initialBalance: 0,
    createdAt: now,
    updatedAt: now,
  });
  food = await db.categories.add({
    name: 'Food',
    type: 'expense',
    icon: 'Utensils',
    createdAt: now,
  });
  salary = await db.categories.add({
    name: 'Salary',
    type: 'income',
    icon: 'Wallet',
    createdAt: now,
  });

  await createTransaction({
    type: 'income',
    amount: 500000,
    accountId: bca,
    categoryId: salary,
    description: 'Gaji',
    date: '2026-09-01',
  });
  await createTransaction({
    type: 'expense',
    amount: 25000,
    accountId: bca,
    categoryId: food,
    description: 'Lunch',
    date: '2026-09-19',
  });
  await createTransaction({
    type: 'transfer',
    amount: 50000,
    accountId: bca,
    destinationAccountId: cash,
    description: 'Tarik tunai',
    date: '2026-09-20',
  });
  await createTransaction({
    type: 'expense',
    amount: 15000,
    accountId: cash,
    categoryId: food,
    description: 'Coffee',
    date: '2026-10-02',
  });
});

describe('createTransaction', () => {
  it('rejects non-positive amounts', async () => {
    await expect(
      createTransaction({
        type: 'expense',
        amount: 0,
        accountId: bca,
        description: '',
        date: '2026-09-01',
      })
    ).rejects.toThrow(/greater than zero/);
  });

  it('rejects transfers to the same account', async () => {
    await expect(
      createTransaction({
        type: 'transfer',
        amount: 1,
        accountId: bca,
        destinationAccountId: bca,
        description: '',
        date: '2026-09-01',
      })
    ).rejects.toThrow(/identical/);
  });

  it('drops category on transfers and destination on non-transfers', async () => {
    const id = await createTransaction({
      type: 'expense',
      amount: 1,
      accountId: bca,
      destinationAccountId: cash,
      categoryId: food,
      description: ' x ',
      date: '2026-09-01',
    });
    const tx = await db.transactions.get(id);
    expect(tx?.destinationAccountId).toBeUndefined();
    expect(tx?.categoryId).toBe(food);
    expect(tx?.description).toBe('x');
  });
});

describe('getFilteredTransactions', () => {
  it('filters by month using the date index', async () => {
    const txs = await getFilteredTransactions({ year: 2026, month: 8 });
    expect(txs.map((t) => t.description)).toEqual(['Tarik tunai', 'Lunch', 'Gaji']);
  });

  it('matches an account as source or destination', async () => {
    const txs = await getFilteredTransactions({ accountId: cash });
    expect(txs.map((t) => t.description).sort()).toEqual(['Coffee', 'Tarik tunai']);
  });

  it('combines category, type, search and sort', async () => {
    const txs = await getFilteredTransactions({
      categoryId: food,
      type: 'expense',
      sortBy: 'amount_asc',
    });
    expect(txs.map((t) => t.amount)).toEqual([15000, 25000]);

    const searched = await getFilteredTransactions({ search: 'lun' });
    expect(searched).toHaveLength(1);
  });
});

describe('getMonthlyDashboardSummary', () => {
  it('computes balance, monthly totals and expense breakdown', async () => {
    const summary = await getMonthlyDashboardSummary(2026, 8);
    // 100000 initial + 500000 income - 25000 - 15000 expenses; transfers cancel out
    expect(summary.currentBalance).toBe(560000);
    expect(summary.monthlyIncome).toBe(500000);
    expect(summary.monthlyExpense).toBe(25000);
    expect(summary.netCashFlow).toBe(475000);
    expect(summary.expenseBreakdown).toEqual([
      {
        categoryId: food,
        categoryName: 'Food',
        categoryIcon: 'Utensils',
        amount: 25000,
        percentage: 100,
      },
    ]);
  });
});

describe('updateTransaction / deleteTransaction', () => {
  it('updates and deletes a transaction', async () => {
    const [lunch] = await getFilteredTransactions({ search: 'lunch' });
    await updateTransaction(lunch.id!, {
      type: 'expense',
      amount: 30000,
      accountId: bca,
      categoryId: food,
      description: 'Dinner',
      date: '2026-09-19',
    });
    expect((await db.transactions.get(lunch.id!))?.amount).toBe(30000);

    await deleteTransaction(lunch.id!);
    expect(await db.transactions.get(lunch.id!)).toBeUndefined();
  });
});
