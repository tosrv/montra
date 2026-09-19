import { db } from '../db/database.ts';
import type { Account, AccountWithBalance, AccountType } from '../types.ts';

export async function getAllAccounts(): Promise<Account[]> {
  return await db.accounts.toArray();
}

export async function getAccountsWithBalances(): Promise<AccountWithBalance[]> {
  const accounts = await db.accounts.toArray();
  const transactions = await db.transactions.toArray();

  return accounts.map((account) => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let transferInTotal = 0;
    let transferOutTotal = 0;
    let transactionCount = 0;

    for (const tx of transactions) {
      if (tx.accountId === account.id) {
        transactionCount++;
        if (tx.type === 'income') {
          incomeTotal += tx.amount;
        } else if (tx.type === 'expense') {
          expenseTotal += tx.amount;
        } else if (tx.type === 'transfer') {
          transferOutTotal += tx.amount;
        }
      }

      // Check if destination of transfer
      if (tx.type === 'transfer' && tx.destinationAccountId === account.id) {
        transactionCount++;
        transferInTotal += tx.amount;
      }
    }

    const currentBalance =
      account.initialBalance +
      incomeTotal -
      expenseTotal +
      transferInTotal -
      transferOutTotal;

    return {
      ...account,
      currentBalance,
      incomeTotal,
      expenseTotal,
      transferInTotal,
      transferOutTotal,
      transactionCount,
    };
  });
}

export async function createAccount(data: {
  name: string;
  type: AccountType;
  initialBalance: number;
}): Promise<number> {
  const now = new Date().toISOString();
  const id = await db.accounts.add({
    name: data.name.trim(),
    type: data.type,
    initialBalance: Math.max(0, Math.round(data.initialBalance || 0)),
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateAccount(
  id: number,
  data: { name: string; type: AccountType; initialBalance: number }
): Promise<void> {
  const now = new Date().toISOString();
  await db.accounts.update(id, {
    name: data.name.trim(),
    type: data.type,
    initialBalance: Math.max(0, Math.round(data.initialBalance || 0)),
    updatedAt: now,
  });
}

export async function countAccountTransactions(accountId: number): Promise<number> {
  const asSource = await db.transactions.where('accountId').equals(accountId).count();
  const asDest = await db.transactions.where('destinationAccountId').equals(accountId).count();
  return asSource + asDest;
}

export async function deleteAccount(
  accountId: number,
  force: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const txCount = await countAccountTransactions(accountId);
  if (txCount > 0 && !force) {
    return {
      success: false,
      error: `Cannot delete this account because it has ${txCount} associated transaction(s). Please reassign or delete the transactions first to preserve financial data integrity.`,
    };
  }

  // If forced, delete referencing transactions or prevent
  if (force) {
    const toDelete = await db.transactions
      .filter((tx) => tx.accountId === accountId || tx.destinationAccountId === accountId)
      .toArray();
    for (const tx of toDelete) {
      if (tx.id) await db.transactions.delete(tx.id);
    }
  }

  await db.accounts.delete(accountId);
  return { success: true };
}
