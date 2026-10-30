import { db } from '../db/database.ts';
import { getTodayDateString, isDateInMonth } from '../utils/dates.ts';
import type { Transaction, TransactionType } from '../types.ts';

export interface TransactionFilterOptions {
  search?: string;
  year?: number;
  month?: number; // 0-11
  type?: 'all' | TransactionType;
  categoryId?: number;
  accountId?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy('date').reverse().toArray();
}

/**
 * Narrows the candidate set with the most selective available index so the
 * in-memory filters below don't have to scan every transaction.
 */
async function queryIndexedCandidates(options: TransactionFilterOptions): Promise<Transaction[]> {
  if (options.year !== undefined && options.month !== undefined) {
    const prefix = `${options.year}-${String(options.month + 1).padStart(2, '0')}-`;
    return await db.transactions.where('date').startsWith(prefix).toArray();
  }
  if (options.accountId) {
    return await db.transactions
      .where('accountId')
      .equals(options.accountId)
      .or('destinationAccountId')
      .equals(options.accountId)
      .toArray();
  }
  if (options.categoryId) {
    return await db.transactions.where('categoryId').equals(options.categoryId).toArray();
  }
  if (options.type && options.type !== 'all') {
    return await db.transactions.where('type').equals(options.type).toArray();
  }
  return await db.transactions.toArray();
}

export async function getFilteredTransactions(
  options: TransactionFilterOptions
): Promise<Transaction[]> {
  let txs = await queryIndexedCandidates(options);

  // Search filter (description)
  if (options.search && options.search.trim() !== '') {
    const q = options.search.toLowerCase().trim();
    txs = txs.filter(
      (tx) => tx.description.toLowerCase().includes(q) || tx.amount.toString().includes(q)
    );
  }

  // Month & Year filter
  if (options.year !== undefined && options.month !== undefined) {
    txs = txs.filter((tx) => isDateInMonth(tx.date, options.year!, options.month!));
  }

  // Type filter
  if (options.type && options.type !== 'all') {
    txs = txs.filter((tx) => tx.type === options.type);
  }

  // Category filter
  if (options.categoryId !== undefined && options.categoryId !== 0) {
    txs = txs.filter((tx) => tx.categoryId === options.categoryId);
  }

  // Account filter (matches source or destination)
  if (options.accountId !== undefined && options.accountId !== 0) {
    txs = txs.filter(
      (tx) => tx.accountId === options.accountId || tx.destinationAccountId === options.accountId
    );
  }

  // Sorting
  const sortBy = options.sortBy || 'date_desc';
  txs.sort((a, b) => {
    if (sortBy === 'date_desc') {
      const cmp = b.date.localeCompare(a.date);
      if (cmp !== 0) return cmp;
      return (b.id || 0) - (a.id || 0);
    }
    if (sortBy === 'date_asc') {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.id || 0) - (b.id || 0);
    }
    if (sortBy === 'amount_desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  return txs;
}

export async function getMonthlyDashboardSummary(
  year: number,
  month: number
): Promise<{
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  expenseBreakdown: {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: Transaction[];
}> {
  const allAccounts = await db.accounts.toArray();
  const allTransactions = await db.transactions.toArray();
  const allCategories = await db.categories.toArray();

  const categoryMap = new Map(allCategories.map((c) => [c.id!, c]));

  // Calculate Overall Current Balance across all accounts:
  // sum(initialBalance) + sum(income) - sum(expense)
  // transfers cancel out across all accounts
  let currentBalance = allAccounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
  for (const tx of allTransactions) {
    if (tx.type === 'income') {
      currentBalance += tx.amount;
    } else if (tx.type === 'expense') {
      currentBalance -= tx.amount;
    }
  }

  // Calculate Monthly Figures for selected month
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  const expenseByCategory = new Map<number, number>();

  const monthlyTransactions: Transaction[] = [];

  for (const tx of allTransactions) {
    if (isDateInMonth(tx.date, year, month)) {
      monthlyTransactions.push(tx);
      if (tx.type === 'income') {
        monthlyIncome += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyExpense += tx.amount;
        if (tx.categoryId) {
          const prev = expenseByCategory.get(tx.categoryId) || 0;
          expenseByCategory.set(tx.categoryId, prev + tx.amount);
        } else {
          const uncategorizedKey = -1;
          const prev = expenseByCategory.get(uncategorizedKey) || 0;
          expenseByCategory.set(uncategorizedKey, prev + tx.amount);
        }
      }
    }
  }

  // Net cash flow: monthlyIncome - monthlyExpense (transfers do not affect this)
  const netCashFlow = monthlyIncome - monthlyExpense;

  // Build expense breakdown
  const expenseBreakdown = Array.from(expenseByCategory.entries())
    .map(([catId, amount]) => {
      const cat = categoryMap.get(catId);
      const categoryName = cat ? cat.name : 'Other / Uncategorized';
      const categoryIcon = cat ? cat.icon : 'CircleDot';
      const percentage = monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0;
      return {
        categoryId: catId,
        categoryName,
        categoryIcon,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Sort monthly transactions by date descending
  monthlyTransactions.sort((a, b) => {
    const cmp = b.date.localeCompare(a.date);
    if (cmp !== 0) return cmp;
    return (b.id || 0) - (a.id || 0);
  });

  return {
    currentBalance,
    monthlyIncome,
    monthlyExpense,
    netCashFlow,
    expenseBreakdown,
    recentTransactions: monthlyTransactions.slice(0, 5),
  };
}

export async function createTransaction(data: {
  type: TransactionType;
  amount: number;
  accountId: number;
  destinationAccountId?: number;
  categoryId?: number;
  description: string;
  date: string;
}): Promise<number> {
  if (data.amount <= 0) {
    throw new Error('Transaction amount must be greater than zero');
  }
  if (!data.accountId) {
    throw new Error('Source account is required');
  }
  if (data.type === 'transfer') {
    if (!data.destinationAccountId) {
      throw new Error('Destination account is required for transfers');
    }
    if (data.accountId === data.destinationAccountId) {
      throw new Error('Source and destination accounts cannot be identical');
    }
  }

  const now = new Date().toISOString();
  const id = await db.transactions.add({
    type: data.type,
    amount: Math.round(data.amount),
    accountId: data.accountId,
    destinationAccountId: data.type === 'transfer' ? data.destinationAccountId : undefined,
    categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
    description: data.description.trim(),
    date: data.date,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateTransaction(
  id: number,
  data: {
    type: TransactionType;
    amount: number;
    accountId: number;
    destinationAccountId?: number;
    categoryId?: number;
    description: string;
    date: string;
  }
): Promise<void> {
  if (data.amount <= 0) {
    throw new Error('Transaction amount must be greater than zero');
  }
  if (!data.accountId) {
    throw new Error('Source account is required');
  }
  if (data.type === 'transfer') {
    if (!data.destinationAccountId) {
      throw new Error('Destination account is required for transfers');
    }
    if (data.accountId === data.destinationAccountId) {
      throw new Error('Source and destination accounts cannot be identical');
    }
  }

  const now = new Date().toISOString();
  await db.transactions.update(id, {
    type: data.type,
    amount: Math.round(data.amount),
    accountId: data.accountId,
    destinationAccountId: data.type === 'transfer' ? data.destinationAccountId : undefined,
    categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
    description: data.description.trim(),
    date: data.date,
    updatedAt: now,
  });
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}

export interface CashflowPoint {
  year: number;
  month: number; // 0-11
  income: number;
  expense: number;
}

/**
 * Income vs expense per month for the `months` months ending at (year, month).
 * Transfers are excluded since they don't change overall cash.
 */
export async function getCashflowTrend(
  year: number,
  month: number,
  months = 6
): Promise<CashflowPoint[]> {
  const points: CashflowPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    points.push({ year: d.getFullYear(), month: d.getMonth(), income: 0, expense: 0 });
  }

  const toKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`;
  const first = points[0];
  const last = points[points.length - 1];
  const txs = await db.transactions
    .where('date')
    .between(
      `${toKey(first.year, first.month)}-01`,
      `${toKey(last.year, last.month)}-99`,
      true,
      true
    )
    .toArray();

  const byKey = new Map(points.map((p) => [toKey(p.year, p.month), p]));
  for (const tx of txs) {
    const point = byKey.get(tx.date.slice(0, 7));
    if (!point) continue;
    if (tx.type === 'income') point.income += tx.amount;
    else if (tx.type === 'expense') point.expense += tx.amount;
  }
  return points;
}

export interface BalancePoint {
  date: string; // YYYY-MM-DD
  balance: number;
}

/**
 * Total balance across all accounts at the end of each day of the month.
 * Days after today are omitted for the current month.
 */
export async function getDailyBalanceSeries(year: number, month: number): Promise<BalancePoint[]> {
  const [accounts, txs] = await Promise.all([db.accounts.toArray(), db.transactions.toArray()]);
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const startDate = `${monthKey}-01`;

  let balance = accounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
  const dailyDelta = new Map<string, number>();
  for (const tx of txs) {
    const delta = tx.type === 'income' ? tx.amount : tx.type === 'expense' ? -tx.amount : 0;
    if (delta === 0) continue;
    if (tx.date < startDate) balance += delta;
    else if (tx.date.startsWith(monthKey)) {
      dailyDelta.set(tx.date, (dailyDelta.get(tx.date) || 0) + delta);
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayDateString();
  const points: BalancePoint[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${monthKey}-${String(day).padStart(2, '0')}`;
    if (date > today) break;
    balance += dailyDelta.get(date) || 0;
    points.push({ date, balance });
  }
  return points;
}
