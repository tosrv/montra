import { db } from '../db/database.ts';
import { isDateInMonth } from '../utils/dates.ts';
import type {
  Budget,
  BudgetCategory,
  BudgetCategoryStatus,
  BudgetHealthStatus,
  MonthlyBudgetOverview,
} from '../types.ts';

export async function getBudgetForMonth(year: number, month: number): Promise<Budget | undefined> {
  const all = await db.budgets.toArray();
  return all.find((b) => b.year === year && b.month === month);
}

export async function getBudgetCategories(budgetId: number): Promise<BudgetCategory[]> {
  return await db.budgetCategories.where('budgetId').equals(budgetId).toArray();
}

export function computeBudgetHealth(
  totalSpent: number,
  totalBudget: number
): { healthStatus: BudgetHealthStatus; percentageUsed: number } {
  if (totalBudget <= 0) {
    return {
      healthStatus: totalSpent > 0 ? 'over_budget' : 'on_track',
      percentageUsed: totalSpent > 0 ? 100 : 0,
    };
  }

  const percentageUsed = Math.round((totalSpent / totalBudget) * 100);

  let healthStatus: BudgetHealthStatus = 'on_track';
  if (totalSpent > totalBudget) {
    healthStatus = 'over_budget';
  } else if (percentageUsed >= 80) {
    healthStatus = 'watch_spending';
  } else {
    healthStatus = 'on_track';
  }

  return { healthStatus, percentageUsed };
}

export async function getMonthlyBudgetOverview(
  year: number,
  month: number
): Promise<MonthlyBudgetOverview> {
  const [budget, allCategories, allTransactions] = await Promise.all([
    getBudgetForMonth(year, month),
    db.categories.toArray(),
    db.transactions.toArray(),
  ]);

  const categoryMap = new Map(allCategories.map((c) => [c.id!, c]));

  // 1. Calculate actual spending and income from transactions for this month
  let monthlyIncome = 0;
  let totalSpent = 0;
  const expenseByCategory = new Map<number, number>();

  for (const tx of allTransactions) {
    if (isDateInMonth(tx.date, year, month)) {
      if (tx.type === 'income') {
        monthlyIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalSpent += tx.amount;
        const catId = tx.categoryId !== undefined ? tx.categoryId : -1;
        const current = expenseByCategory.get(catId) || 0;
        expenseByCategory.set(catId, current + tx.amount);
      }
    }
  }

  // 2. If no budget exists for this month, return empty state overview
  if (!budget) {
    const unbudgetedCategories: {
      categoryId: number;
      categoryName: string;
      categoryIcon: string;
      actualSpent: number;
    }[] = [];

    for (const [catId, spent] of expenseByCategory.entries()) {
      const cat = categoryMap.get(catId);
      unbudgetedCategories.push({
        categoryId: catId,
        categoryName: cat ? cat.name : 'Uncategorized',
        categoryIcon: cat ? cat.icon : 'CircleDot',
        actualSpent: spent,
      });
    }

    return {
      hasBudget: false,
      budget: undefined,
      year,
      month,
      monthlyIncome,
      totalBudget: 0,
      totalSpent,
      remaining: 0,
      percentageUsed: 0,
      healthStatus: 'on_track',
      healthReason: '',
      categoryBudgets: [],
      unbudgetedCategories: unbudgetedCategories.sort((a, b) => b.actualSpent - a.actualSpent),
      totalAllocatedToCategories: 0,
    };
  }

  // 3. Budget exists: load category budget entries
  const budgetCats = await getBudgetCategories(budget.id!);
  const budgetedCatIds = new Set(budgetCats.map((bc) => bc.categoryId));

  const categoryBudgets: BudgetCategoryStatus[] = budgetCats.map((bc) => {
    const cat = categoryMap.get(bc.categoryId);
    const actualSpent = expenseByCategory.get(bc.categoryId) || 0;
    const remaining = bc.amount - actualSpent;
    const percentage = bc.amount > 0 ? Math.round((actualSpent / bc.amount) * 100) : 0;
    const isOverBudget = actualSpent > bc.amount;

    return {
      id: bc.id,
      categoryId: bc.categoryId,
      categoryName: cat ? cat.name : 'Unknown Category',
      categoryIcon: cat ? cat.icon : 'CircleDot',
      budgetedAmount: bc.amount,
      actualSpent,
      remaining,
      percentage,
      isOverBudget,
    };
  });

  // Sort category budgets: over-budget first, then highest percentage
  categoryBudgets.sort((a, b) => {
    if (a.isOverBudget !== b.isOverBudget) {
      return a.isOverBudget ? -1 : 1;
    }
    return b.percentage - a.percentage;
  });

  // 4. Identify expense categories with spending that are not budgeted
  const unbudgetedCategories: {
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    actualSpent: number;
  }[] = [];

  for (const [catId, spent] of expenseByCategory.entries()) {
    if (!budgetedCatIds.has(catId)) {
      const cat = categoryMap.get(catId);
      unbudgetedCategories.push({
        categoryId: catId,
        categoryName: cat ? cat.name : 'Uncategorized',
        categoryIcon: cat ? cat.icon : 'CircleDot',
        actualSpent: spent,
      });
    }
  }
  unbudgetedCategories.sort((a, b) => b.actualSpent - a.actualSpent);

  const totalAllocatedToCategories = budgetCats.reduce((acc, c) => acc + c.amount, 0);
  const remaining = budget.totalBudget - totalSpent;
  const { healthStatus, percentageUsed } = computeBudgetHealth(totalSpent, budget.totalBudget);

  let healthReason = '';
  if (healthStatus === 'over_budget') {
    healthReason = `Over budget by ${Math.abs(remaining).toLocaleString()}`;
  } else if (healthStatus === 'watch_spending') {
    healthReason = `Approaching budget limit (${percentageUsed}% used)`;
  } else {
    healthReason = `Within planned budget (${percentageUsed}% used)`;
  }

  return {
    hasBudget: true,
    budget,
    year,
    month,
    monthlyIncome,
    totalBudget: budget.totalBudget,
    totalSpent,
    remaining,
    percentageUsed,
    healthStatus,
    healthReason,
    categoryBudgets,
    unbudgetedCategories,
    totalAllocatedToCategories,
  };
}

export async function createOrUpdateMonthlyBudget(
  year: number,
  month: number,
  totalBudget: number,
  categoryAllocations?: { categoryId: number; amount: number }[]
): Promise<Budget> {
  const cleanAmount = Math.max(0, Math.round(totalBudget));
  const now = new Date().toISOString();

  let existing = await getBudgetForMonth(year, month);
  let budgetId: number;

  if (existing && existing.id) {
    await db.budgets.update(existing.id, {
      totalBudget: cleanAmount,
      updatedAt: now,
    });
    budgetId = existing.id;
    existing.totalBudget = cleanAmount;
    existing.updatedAt = now;
  } else {
    budgetId = await db.budgets.add({
      year,
      month,
      totalBudget: cleanAmount,
      createdAt: now,
      updatedAt: now,
    });
    existing = {
      id: budgetId,
      year,
      month,
      totalBudget: cleanAmount,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Handle category allocations if passed
  if (categoryAllocations && categoryAllocations.length > 0) {
    for (const alloc of categoryAllocations) {
      if (alloc.categoryId) {
        await setCategoryBudget(budgetId, alloc.categoryId, alloc.amount);
      }
    }
  }

  return existing;
}

export async function deleteMonthlyBudget(budgetId: number): Promise<void> {
  await db.transaction('rw', [db.budgets, db.budgetCategories], async () => {
    await db.budgetCategories.where('budgetId').equals(budgetId).delete();
    await db.budgets.delete(budgetId);
  });
}

export async function setCategoryBudget(
  budgetId: number,
  categoryId: number,
  amount: number
): Promise<number> {
  const cleanAmount = Math.max(0, Math.round(amount));
  const now = new Date().toISOString();

  const existing = await db.budgetCategories
    .where('budgetId')
    .equals(budgetId)
    .filter((bc) => bc.categoryId === categoryId)
    .first();

  if (existing && existing.id) {
    await db.budgetCategories.update(existing.id, {
      amount: cleanAmount,
      updatedAt: now,
    });
    return existing.id;
  }

  return await db.budgetCategories.add({
    budgetId,
    categoryId,
    amount: cleanAmount,
    createdAt: now,
    updatedAt: now,
  });
}

export async function deleteCategoryBudget(budgetCategoryId: number): Promise<void> {
  await db.budgetCategories.delete(budgetCategoryId);
}

export async function getPreviousMonthBudget(
  currentYear: number,
  currentMonth: number
): Promise<{ budget: Budget; categories: BudgetCategory[] } | null> {
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const prevBudget = await getBudgetForMonth(prevYear, prevMonth);
  if (!prevBudget || !prevBudget.id) return null;

  const categories = await getBudgetCategories(prevBudget.id);
  return { budget: prevBudget, categories };
}

export async function copyBudgetFromPreviousMonth(
  targetYear: number,
  targetMonth: number
): Promise<Budget | null> {
  const prevData = await getPreviousMonthBudget(targetYear, targetMonth);
  if (!prevData) return null;

  const allocations = prevData.categories.map((c) => ({
    categoryId: c.categoryId,
    amount: c.amount,
  }));

  return await createOrUpdateMonthlyBudget(
    targetYear,
    targetMonth,
    prevData.budget.totalBudget,
    allocations
  );
}
