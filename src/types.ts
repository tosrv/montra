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

export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  settings: AppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export type AnalyticsEventName =
  | 'first_visit'
  | 'app_opened'
  | 'landing_page_viewed'
  | 'start_tracking_clicked'
  | 'transaction_created'
  | 'transaction_edited'
  | 'transaction_deleted'
  | 'account_created'
  | 'category_created'
  | 'backup_exported'
  | 'backup_imported'
  | 'csv_exported';

export interface AnalyticsEvent {
  event_name: AnalyticsEventName;
  anonymous_installation_id: string;
  app_version: string;
  timestamp: string;
  platform?: string;
  browser_family?: string;
}
