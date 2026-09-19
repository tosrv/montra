import { useState, useEffect, useCallback } from 'react';
import { getMonthlyDashboardSummary } from '../services/transactionService.ts';
import { getCurrentMonthYear } from '../utils/dates.ts';
import type { Transaction } from '../types.ts';

export function useDashboard() {
  const initial = getCurrentMonthYear();
  const [selectedYear, setSelectedYear] = useState<number>(initial.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initial.month);

  const [data, setData] = useState<{
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
  }>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    netCashFlow: 0,
    expenseBreakdown: [],
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const summary = await getMonthlyDashboardSummary(selectedYear, selectedMonth);
      setData(summary);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

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

  return {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    data,
    loading,
    refreshDashboard,
  };
}
