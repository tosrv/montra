import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database.ts';
import {
  createAccount,
  deleteAccount,
  getAccountsWithBalances,
  updateAccount,
} from './accountService.ts';
import { createTransaction } from './transactionService.ts';

let bca: number;
let cash: number;

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  bca = await createAccount({ name: ' BCA ', type: 'bank', initialBalance: 100000 });
  cash = await createAccount({ name: 'Cash', type: 'cash', initialBalance: 0 });
  await createTransaction({
    type: 'transfer',
    amount: 40000,
    accountId: bca,
    destinationAccountId: cash,
    description: '',
    date: '2026-09-01',
  });
});

describe('accountService', () => {
  it('trims names and clamps negative initial balances', async () => {
    expect((await db.accounts.get(bca))?.name).toBe('BCA');
    await updateAccount(cash, { name: 'Cash', type: 'cash', initialBalance: -500 });
    expect((await db.accounts.get(cash))?.initialBalance).toBe(0);
  });

  it('applies transfers to both account balances', async () => {
    const accounts = await getAccountsWithBalances();
    const byId = new Map(accounts.map((a) => [a.id, a]));
    expect(byId.get(bca)?.currentBalance).toBe(60000);
    expect(byId.get(cash)?.currentBalance).toBe(40000);
  });

  it('refuses to delete an account with transactions unless forced', async () => {
    const blocked = await deleteAccount(cash);
    expect(blocked.success).toBe(false);
    expect(await db.accounts.get(cash)).toBeDefined();

    const forced = await deleteAccount(cash, true);
    expect(forced.success).toBe(true);
    expect(await db.accounts.get(cash)).toBeUndefined();
    expect(await db.transactions.count()).toBe(0);
  });
});
