import type { Account, Transaction } from '../types.ts';

export interface AccountBalanceTotals {
  currentBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  transferInTotal: number;
  transferOutTotal: number;
  transactionCount: number;
}

/**
 * Pure balance computation used by account listings.
 * currentBalance = initial + income - expense + transferIn - transferOut
 */
export function computeAccountBalance(
  account: Pick<Account, 'id' | 'initialBalance'>,
  transactions: Transaction[]
): AccountBalanceTotals {
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

    if (tx.type === 'transfer' && tx.destinationAccountId === account.id) {
      transactionCount++;
      transferInTotal += tx.amount;
    }
  }

  return {
    currentBalance:
      account.initialBalance + incomeTotal - expenseTotal + transferInTotal - transferOutTotal,
    incomeTotal,
    expenseTotal,
    transferInTotal,
    transferOutTotal,
    transactionCount,
  };
}
