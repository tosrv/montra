import { useState, useEffect, useCallback } from 'react';
import {
  getMonthlyBudgetOverview,
  createOrUpdateMonthlyBudget,
  deleteMonthlyBudget,
  setCategoryBudget,
  deleteCategoryBudget,
  copyBudgetFromPreviousMonth,
  getPreviousMonthBudget,
} from '../services/budgetService.ts';
import { getCurrentMonthYear } from '../utils/dates.ts';
import type { MonthlyBudgetOverview } from '../types.ts';

export function useBudget(initialYear?: number, initialMonth?: number) {
  const current = getCurrentMonthYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear !== undefined ? initialYear : current.year
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    initialMonth !== undefined ? initialMonth : current.month
  );

  const [overview, setOverview] = useState<MonthlyBudgetOverview>({
    hasBudget: false,
    year: selectedYear,
    month: selectedMonth,
    monthlyIncome: 0,
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    percentageUsed: 0,
    healthStatus: 'on_track',
    healthReason: '',
    categoryBudgets: [],
    unbudgetedCategories: [],
    totalAllocatedToCategories: 0,
  });

  const [loading, setLoading] = useState(true);
  const [hasPreviousBudget, setHasPreviousBudget] = useState(false);

  const refreshBudget = useCallback(async () => {
    try {
      setLoading(true);
      const [data, prev] = await Promise.all([
        getMonthlyBudgetOverview(selectedYear, selectedMonth),
        getPreviousMonthBudget(selectedYear, selectedMonth),
      ]);
      setOverview(data);
      setHasPreviousBudget(!!prev);
    } catch (err) {
      console.error('Failed to load budget overview:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  useEffect(() => {
    const handleTxChanged = () => {
      refreshBudget();
    };
    window.addEventListener('money-tracker-tx-changed', handleTxChanged);
    window.addEventListener('money-tracker-budget-changed', handleTxChanged);
    return () => {
      window.removeEventListener('money-tracker-tx-changed', handleTxChanged);
      window.removeEventListener('money-tracker-budget-changed', handleTxChanged);
    };
  }, [refreshBudget]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const saveMonthlyBudget = async (
    totalBudget: number,
    categoryAllocations?: { categoryId: number; amount: number }[]
  ) => {
    await createOrUpdateMonthlyBudget(
      selectedYear,
      selectedMonth,
      totalBudget,
      categoryAllocations
    );
    window.dispatchEvent(new CustomEvent('money-tracker-budget-changed'));
    await refreshBudget();
  };

  const removeMonthlyBudget = async () => {
    if (overview.budget?.id) {
      await deleteMonthlyBudget(overview.budget.id);
      window.dispatchEvent(new CustomEvent('money-tracker-budget-changed'));
      await refreshBudget();
    }
  };

  const saveCategoryBudget = async (categoryId: number, amount: number) => {
    // If no monthly budget exists yet, create one with at least this amount
    let budgetId = overview.budget?.id;
    if (!budgetId) {
      const newBudget = await createOrUpdateMonthlyBudget(
        selectedYear,
        selectedMonth,
        amount,
        [{ categoryId, amount }]
      );
      budgetId = newBudget.id;
    } else {
      await setCategoryBudget(budgetId, categoryId, amount);
    }
    window.dispatchEvent(new CustomEvent('money-tracker-budget-changed'));
    await refreshBudget();
  };

  const removeCategoryBudget = async (budgetCategoryId: number) => {
    await deleteCategoryBudget(budgetCategoryId);
    window.dispatchEvent(new CustomEvent('money-tracker-budget-changed'));
    await refreshBudget();
  };

  const copyPreviousMonth = async () => {
    const copied = await copyBudgetFromPreviousMonth(selectedYear, selectedMonth);
    if (copied) {
      window.dispatchEvent(new CustomEvent('money-tracker-budget-changed'));
      await refreshBudget();
    }
  };

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    overview,
    loading,
    hasPreviousBudget,
    refreshBudget,
    saveMonthlyBudget,
    removeMonthlyBudget,
    saveCategoryBudget,
    removeCategoryBudget,
    copyPreviousMonth,
  };
}
