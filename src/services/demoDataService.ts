import { db } from '../db/database.ts';
import { restoreBackupData } from './backupService.ts';
import type {
  Account,
  AppSettings,
  BackupData,
  Budget,
  BudgetCategory,
  Category,
  Transaction,
} from '../types.ts';

const MONTHS_OF_HISTORY = 6;

// Fixed IDs so transactions and budgets can reference them directly.
const ACC = { bca: 1, jago: 2, bni: 3, cash: 4 } as const;
const CAT = {
  salary: 1,
  freelance: 2,
  business: 3,
  otherIncome: 4,
  food: 5,
  transport: 6,
  bills: 7,
  shopping: 8,
  education: 9,
  entertainment: 10,
  health: 11,
  otherExpense: 12,
} as const;

/** Small deterministic PRNG (mulberry32) so demo data is stable and testable. */
function createRandom(seed: number) {
  let a = seed;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    chance: (p: number) => next() < p,
    /** Integer amount in [min, max], rounded to `step` (e.g. Rp 500). */
    amount: (min: number, max: number, step = 500) =>
      Math.round((min + next() * (max - min)) / step) * step,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
  };
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Builds ~6 months of realistic Indonesian personal-finance data ending at `today`,
 * including budgets for the current and previous month.
 */
export function generateDemoData(settings: AppSettings, today = new Date()): BackupData {
  const rand = createRandom(20260930);
  const now = today.toISOString();
  const todayStr = toDateString(today);

  const accounts: Account[] = [
    {
      id: ACC.bca,
      name: 'BCA',
      type: 'bank',
      initialBalance: 6500000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ACC.jago,
      name: 'Jago',
      type: 'bank',
      initialBalance: 1500000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ACC.bni,
      name: 'BNI',
      type: 'bank',
      initialBalance: 3000000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: ACC.cash,
      name: 'Cash',
      type: 'cash',
      initialBalance: 400000,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const categories: Category[] = [
    { id: CAT.salary, name: 'Salary', type: 'income', icon: 'Wallet', createdAt: now },
    { id: CAT.freelance, name: 'Freelance', type: 'income', icon: 'Briefcase', createdAt: now },
    { id: CAT.business, name: 'Business', type: 'income', icon: 'TrendingUp', createdAt: now },
    { id: CAT.otherIncome, name: 'Other', type: 'income', icon: 'CircleDot', createdAt: now },
    { id: CAT.food, name: 'Food', type: 'expense', icon: 'Utensils', createdAt: now },
    { id: CAT.transport, name: 'Transport', type: 'expense', icon: 'Car', createdAt: now },
    { id: CAT.bills, name: 'Bills', type: 'expense', icon: 'Receipt', createdAt: now },
    { id: CAT.shopping, name: 'Shopping', type: 'expense', icon: 'ShoppingBag', createdAt: now },
    {
      id: CAT.education,
      name: 'Education',
      type: 'expense',
      icon: 'GraduationCap',
      createdAt: now,
    },
    { id: CAT.entertainment, name: 'Entertainment', type: 'expense', icon: 'Film', createdAt: now },
    { id: CAT.health, name: 'Health', type: 'expense', icon: 'HeartPulse', createdAt: now },
    { id: CAT.otherExpense, name: 'Other', type: 'expense', icon: 'CircleDot', createdAt: now },
  ];

  const transactions: Transaction[] = [];
  const add = (
    date: Date,
    type: Transaction['type'],
    amount: number,
    accountId: number,
    description: string,
    categoryOrDestination?: number
  ) => {
    const dateStr = toDateString(date);
    if (dateStr > todayStr) return;
    transactions.push({
      id: transactions.length + 1,
      type,
      amount,
      accountId,
      categoryId: type === 'transfer' ? undefined : categoryOrDestination,
      destinationAccountId: type === 'transfer' ? categoryOrDestination : undefined,
      description,
      date: dateStr,
      createdAt: now,
      updatedAt: now,
    });
  };

  const meals = ['Makan siang', 'Sarapan', 'Kopi', 'Makan malam', 'GoFood', 'Warteg', 'Bakso'];
  const rides = ['Gojek', 'Grab', 'KRL', 'Bensin', 'Parkir', 'TransJakarta'];
  const shops = ['Tokopedia', 'Shopee', 'Indomaret', 'Alfamart', 'Uniqlo'];
  const fun = ['Netflix', 'Bioskop', 'Spotify', 'Nongkrong', 'Konser'];

  for (let offset = MONTHS_OF_HISTORY - 1; offset >= 0; offset--) {
    const first = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const day = (d: number) => new Date(y, m, Math.min(d, daysInMonth));

    // Income
    add(day(25), 'income', 12500000, ACC.bca, 'Gaji bulanan', CAT.salary);
    if (rand.chance(0.6)) {
      add(
        day(rand.amount(8, 20, 1)),
        'income',
        rand.amount(1500000, 4500000, 50000),
        ACC.jago,
        'Proyek freelance',
        CAT.freelance
      );
    }
    if (rand.chance(0.25)) {
      add(
        day(rand.amount(1, 28, 1)),
        'income',
        rand.amount(200000, 800000, 50000),
        ACC.cash,
        'Jual barang bekas',
        CAT.otherIncome
      );
    }

    // Fixed bills
    add(day(1), 'expense', 2750000, ACC.bca, 'Sewa kos', CAT.bills);
    add(day(5), 'expense', rand.amount(380000, 520000, 1000), ACC.bca, 'Listrik PLN', CAT.bills);
    add(day(7), 'expense', 385000, ACC.bca, 'Internet IndiHome', CAT.bills);
    add(day(10), 'expense', 150000, ACC.jago, 'Pulsa & paket data', CAT.bills);
    add(day(3), 'expense', 186000, ACC.jago, 'Netflix & Spotify', CAT.entertainment);

    // Monthly transfers
    add(day(26), 'transfer', 2000000, ACC.bca, 'Isi saldo Jago', ACC.jago);
    add(day(26), 'transfer', 1000000, ACC.bca, 'Tarik tunai', ACC.cash);
    add(day(27), 'transfer', 1500000, ACC.bca, 'Tabungan', ACC.bni);

    // Day-to-day spending
    for (let d = 1; d <= daysInMonth; d++) {
      if (rand.chance(0.8)) {
        add(
          day(d),
          'expense',
          rand.amount(18000, 75000),
          rand.pick([ACC.cash, ACC.jago]),
          rand.pick(meals),
          CAT.food
        );
      }
      if (rand.chance(0.45)) {
        add(
          day(d),
          'expense',
          rand.amount(12000, 60000),
          ACC.jago,
          rand.pick(rides),
          CAT.transport
        );
      }
    }
    for (let i = 0; i < 3; i++) {
      add(
        day(rand.amount(1, 28, 1)),
        'expense',
        rand.amount(90000, 650000, 1000),
        ACC.jago,
        rand.pick(shops),
        CAT.shopping
      );
    }
    for (let i = 0; i < 2; i++) {
      add(
        day(rand.amount(1, 28, 1)),
        'expense',
        rand.amount(50000, 300000, 1000),
        rand.pick([ACC.cash, ACC.jago]),
        rand.pick(fun),
        CAT.entertainment
      );
    }
    add(
      day(rand.amount(1, 28, 1)),
      'expense',
      rand.amount(250000, 450000, 1000),
      ACC.bca,
      'Groceries bulanan',
      CAT.food
    );
    if (rand.chance(0.35)) {
      add(
        day(rand.amount(1, 28, 1)),
        'expense',
        rand.amount(150000, 600000, 1000),
        ACC.bca,
        'Dokter & obat',
        CAT.health
      );
    }
    if (rand.chance(0.5)) {
      add(
        day(rand.amount(1, 28, 1)),
        'expense',
        rand.amount(99000, 450000, 1000),
        ACC.jago,
        'Kursus online',
        CAT.education
      );
    }
    if (rand.chance(0.3)) {
      add(
        day(rand.amount(1, 28, 1)),
        'expense',
        rand.amount(50000, 250000, 1000),
        ACC.cash,
        'Lain-lain',
        CAT.otherExpense
      );
    }
  }

  // Budgets for the previous and current month
  const budgets: Budget[] = [];
  const budgetCategories: BudgetCategory[] = [];
  const allocations: [number, number][] = [
    [CAT.bills, 3900000],
    [CAT.food, 2500000],
    [CAT.transport, 700000],
    [CAT.shopping, 1000000],
    [CAT.entertainment, 600000],
  ];
  for (const offset of [1, 0]) {
    const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const budgetId = budgets.length + 1;
    budgets.push({
      id: budgetId,
      year: d.getFullYear(),
      month: d.getMonth(),
      totalBudget: 9500000,
      createdAt: now,
      updatedAt: now,
    });
    for (const [categoryId, amount] of allocations) {
      budgetCategories.push({
        id: budgetCategories.length + 1,
        budgetId,
        categoryId,
        amount,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return {
    appName: 'MonTra',
    schemaVersion: 2,
    exportedAt: now,
    settings,
    accounts,
    categories,
    transactions,
    budgets,
    budgetCategories,
  };
}

/** Replaces all local data with demo data, keeping the user's preferences. */
export async function loadDemoData(): Promise<void> {
  const settings = (await db.settings.get('default')) ?? {
    id: 'default',
    currency: 'IDR',
    theme: 'system',
    language: 'id' as const,
    schemaVersion: 1,
  };
  await restoreBackupData(generateDemoData(settings));
}
