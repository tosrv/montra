import React, { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatCurrency } from '../../utils/currency.ts';
import { formatMonthYear, getMonthNames, formatDisplayDate } from '../../utils/dates.ts';
import { CategoryIcon } from '../../components/ui/CategoryIcon.tsx';

interface AppContext {
  onOpenAddTransaction: () => void;
}

export function DashboardPage() {
  const { onOpenAddTransaction } = useOutletContext<AppContext>();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    data,
    loading,
    refreshDashboard,
  } = useDashboard();
  const { settings } = useSettings();

  useEffect(() => {
    const handleTxChanged = () => {
      refreshDashboard();
    };
    window.addEventListener('money-tracker-tx-changed', handleTxChanged);
    return () => {
      window.removeEventListener('money-tracker-tx-changed', handleTxChanged);
    };
  }, [refreshDashboard]);

  const monthNames = getMonthNames();
  const years = [
    selectedYear - 2,
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
    selectedYear + 2,
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Month & Year Navigator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            How your money is doing this month
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200/80 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold text-neutral-800 bg-transparent py-1 px-2 rounded-md hover:bg-neutral-50 focus:outline-none cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-semibold text-neutral-800 bg-transparent py-1 px-2 rounded-md hover:bg-neutral-50 focus:outline-none cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1 to 4: Metric Blocks in requested priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Current Balance (Overall) */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">Current Balance</span>
            <Wallet className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tracking-tight">
            {formatCurrency(data.currentBalance, settings.currency)}
          </div>
          <p className="text-[11px] text-neutral-400">All accounts total</p>
        </div>

        {/* 2. Monthly Income */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Monthly Income
            </span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(data.monthlyIncome, settings.currency)}
          </div>
          <p className="text-[11px] text-neutral-400">{formatMonthYear(selectedYear, selectedMonth)}</p>
        </div>

        {/* 3. Monthly Expense */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Monthly Expense
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">
            {formatCurrency(data.monthlyExpense, settings.currency)}
          </div>
          <p className="text-[11px] text-neutral-400">{formatMonthYear(selectedYear, selectedMonth)}</p>
        </div>

        {/* 4. Net Cash Flow */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium uppercase tracking-wider">Net Cash Flow</span>
            {data.netCashFlow >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold tracking-tight ${
              data.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(data.netCashFlow, settings.currency)}
          </div>
          <p className="text-[11px] text-neutral-400">Income minus expense</p>
        </div>
      </div>

      {/* 5. Add Transaction Banner / Action */}
      <div className="p-4 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="text-center sm:text-left">
          <h3 className="text-sm font-semibold">Have a new transaction to record?</h3>
          <p className="text-xs text-neutral-300 mt-0.5">
            Record expenses, income, or transfers between your local accounts anytime.
          </p>
        </div>
        <button
          id="dashboard-add-tx-btn"
          type="button"
          onClick={onOpenAddTransaction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* 6. Expense Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Expense Breakdown</h2>
            <p className="text-xs text-neutral-500">
              Where your money went in {formatMonthYear(selectedYear, selectedMonth)}
            </p>
          </div>
          {data.expenseBreakdown.length > 0 && (
            <span className="text-xs font-semibold text-neutral-500">
              Total: {formatCurrency(data.monthlyExpense, settings.currency)}
            </span>
          )}
        </div>

        {data.expenseBreakdown.length === 0 ? (
          <div className="py-8 text-center text-neutral-400 text-xs">
            No expenses recorded for {formatMonthYear(selectedYear, selectedMonth)}.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {data.expenseBreakdown.map((item) => (
              <div key={item.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
                      <CategoryIcon name={item.categoryIcon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-neutral-800">{item.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                    <span className="text-neutral-400 w-9 text-right font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-800 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Recent Transactions for the Month */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Recent Transactions</h2>
            <p className="text-xs text-neutral-500">
              Latest activity in {formatMonthYear(selectedYear, selectedMonth)}
            </p>
          </div>
          <Link
            to="/app/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">No transactions this month.</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Record your first income, expense, or transfer to get started.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-700'
                        : tx.type === 'expense'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : tx.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 leading-tight">
                      {tx.description || (tx.type === 'transfer' ? 'Account Transfer' : tx.type)}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDisplayDate(tx.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      tx.type === 'income'
                        ? 'text-emerald-700'
                        : tx.type === 'expense'
                        ? 'text-rose-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCurrency(tx.amount, settings.currency)}
                  </div>
                  <span className="text-[10px] text-neutral-400 capitalize">{tx.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
