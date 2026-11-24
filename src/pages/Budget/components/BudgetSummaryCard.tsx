import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Wallet,
} from 'lucide-react';
import { formatMonthYear } from '../../../utils/dates.ts';
import { useLanguage } from '../../../i18n/LanguageProvider.tsx';
import type { MonthlyBudgetOverview } from '../../../types.ts';

interface BudgetSummaryCardProps {
  overview: MonthlyBudgetOverview;
  money: (amount: number) => string;
  selectedYear: number;
  selectedMonth: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetSummaryCard({
  overview,
  money,
  selectedYear,
  selectedMonth,
  onEdit,
  onDelete,
}: BudgetSummaryCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {formatMonthYear(selectedYear, selectedMonth)}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('budget.totalBudget')}: {money(overview.totalBudget)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('budget.editMonthly')}</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title={t('budget.deleteMonthly')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('budget.income')}
            </span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {money(overview.monthlyIncome)}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">From transactions</p>
        </div>

        {/* Total Budget */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('budget.totalBudget')}
            </span>
            <Wallet className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {money(overview.totalBudget)}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Planned limit</p>
        </div>

        {/* Spent */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('budget.spent')}
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
            {money(overview.totalSpent)}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            {t('budget.used', { percentage: overview.percentageUsed })}
          </p>
        </div>

        {/* Remaining */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('budget.remaining')}
            </span>
            {overview.remaining >= 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl font-bold tracking-tight ${
              overview.remaining >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {overview.remaining < 0 ? '-' : ''}
            {money(Math.abs(overview.remaining))}
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
            {overview.remaining >= 0 ? 'Left to spend' : 'Over planned budget'}
          </p>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {t('budget.used', { percentage: overview.percentageUsed })}
          </span>
          <span
            className={`font-semibold ${
              overview.remaining >= 0
                ? 'text-neutral-600 dark:text-neutral-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {overview.remaining >= 0
              ? `${money(overview.remaining)} ${t('budget.remaining').toLowerCase()}`
              : `${money(Math.abs(overview.remaining))} ${t('budget.overBudget').toLowerCase()}`}
          </span>
        </div>

        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overview.healthStatus === 'over_budget'
                ? 'bg-rose-500'
                : overview.healthStatus === 'watch_spending'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(Math.max(overview.percentageUsed, 2), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
