export type TransactionType = 'income' | 'expense' | 'transfer';

export type AccountType = 'bank' | 'cash' | 'other';

export type CategoryType = 'income' | 'expense';

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number; // Integer (e.g., 25000 for Rp 25.000)
  categoryId?: number; // Optional for transfers
  accountId: number; // Source account
  destinationAccountId?: number; // Only for transfers
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  initialBalance: number; // Integer
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id?: number;
  name: string;
  type: CategoryType;
  icon: string; // Lucide icon name
  createdAt: string;
}

export interface AppSettings {
  id: string;
  currency: string; // 'IDR' | 'USD' | 'EUR' etc.
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'id';
  schemaVersion: number;
}

export interface AccountWithBalance extends Account {
  currentBalance: number;
  incomeTotal: number;
  expenseTotal: number;
  transferInTotal: number;
  transferOutTotal: number;
  transactionCount: number;
}

export interface MonthlySummary {
  year: number;
  month: number; // 0-11
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  categoryBreakdown: {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    amount: number;
    percentage: number;
  }[];
  transactionCount: number;
}

export interface Budget {
  id?: number;
  year: number; // e.g. 2026
  month: number; // 0-11
  totalBudget: number; // integer (e.g. 8200000)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface BudgetCategory {
  id?: number;
  budgetId: number;
  categoryId: number;
  amount: number; // integer (e.g. 1500000)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type BudgetHealthStatus = 'on_track' | 'watch_spending' | 'over_budget';

export interface BudgetCategoryStatus {
  id?: number; // budgetCategoryId
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  budgetedAmount: number;
  actualSpent: number;
  remaining: number; // budgetedAmount - actualSpent
  percentage: number; // Math.round((actualSpent / budgetedAmount) * 100)
  isOverBudget: boolean;
}

export interface MonthlyBudgetOverview {
  hasBudget: boolean;
  budget?: Budget;
  year: number;
  month: number;
  monthlyIncome: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  healthStatus: BudgetHealthStatus;
  healthReason: string;
  categoryBudgets: BudgetCategoryStatus[];
  unbudgetedCategories: {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    actualSpent: number;
  }[];
  totalAllocatedToCategories: number;
}

export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  settings: AppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets?: Budget[];
  budgetCategories?: BudgetCategory[];
}
