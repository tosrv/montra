import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  PiggyBank,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Copy,
  Wallet,
} from 'lucide-react';
import { useBudget } from '../../hooks/useBudget.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatCurrency } from '../../utils/currency.ts';
import { formatMonthYear, getMonthNames } from '../../utils/dates.ts';
import { CategoryIcon } from '../../components/ui/CategoryIcon.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { MonthlyBudgetModal } from './MonthlyBudgetModal.tsx';
import { CategoryBudgetModal } from './CategoryBudgetModal.tsx';
import type { BudgetCategoryStatus } from '../../types.ts';

export function BudgetPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { expenseCategories } = useCategories();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    overview,
    loading,
    hasPreviousBudget,
    saveMonthlyBudget,
    removeMonthlyBudget,
    saveCategoryBudget,
    removeCategoryBudget,
    copyPreviousMonth,
  } = useBudget();

  // Modals state
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryStatus, setEditingCategoryStatus] = useState<BudgetCategoryStatus | null>(null);
  const [preselectedCatId, setPreselectedCatId] = useState<number | undefined>(undefined);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);

  // Deletion modals
  const [isDeleteMonthlyConfirmOpen, setIsDeleteMonthlyConfirmOpen] = useState(false);
  const [categoryBudgetToDelete, setCategoryBudgetToDelete] = useState<BudgetCategoryStatus | null>(null);

  const monthNames = getMonthNames();
  const years = [
    selectedYear - 2,
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
    selectedYear + 2,
  ];

  const handleOpenAddCategory = (categoryId?: number, suggestedAmount?: number) => {
    setEditingCategoryStatus(null);
    setPreselectedCatId(categoryId);
    setPrefilledAmount(suggestedAmount);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (status: BudgetCategoryStatus) => {
    setEditingCategoryStatus(status);
    setPreselectedCatId(status.categoryId);
    setPrefilledAmount(status.budgetedAmount);
    setIsCategoryModalOpen(true);
  };

  const handleConfirmDeleteMonthly = async () => {
    await removeMonthlyBudget();
    setIsDeleteMonthlyConfirmOpen(false);
  };

  const handleConfirmDeleteCategory = async () => {
    if (categoryBudgetToDelete?.id) {
      await removeCategoryBudget(categoryBudgetToDelete.id);
    }
    setCategoryBudgetToDelete(null);
  };

  // Find expense categories not yet budgeted
  const budgetedCatIds = new Set(overview.categoryBudgets.map((cb) => cb.categoryId));
  const availableForNewBudget = expenseCategories.filter((c) => !budgetedCatIds.has(c.id!));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {t('budget.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-transparent py-1 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none cursor-pointer"
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
              className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-transparent py-1 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none cursor-pointer"
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
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Empty State when no budget exists for this month */}
      {!overview.hasBudget ? (
        <div className="bg-white dark:bg-neutral-900 p-8 sm:p-12 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto shadow-2xs">
            <PiggyBank className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t('budget.emptyTitle')}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {t('budget.emptySubtitle')}
            </p>
          </div>

          {/* Current Month Spending Context (if any transactions exist) */}
          {overview.totalSpent > 0 && (
            <div className="max-w-sm mx-auto p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
              <span>Actual spending recorded so far:</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(overview.totalSpent, settings.currency)}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="budget-create-btn"
              type="button"
              onClick={() => setIsMonthlyModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('budget.createBtn')}</span>
            </button>

            {hasPreviousBudget && (
              <button
                type="button"
                onClick={copyPreviousMonth}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>{t('budget.copyPrevious')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 3. Active Budget View */
        <div className="space-y-6">
          {/* A. Overall Summary Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {formatMonthYear(selectedYear, selectedMonth)}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('budget.totalBudget')}: {formatCurrency(overview.totalBudget, settings.currency)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMonthlyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('budget.editMonthly')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteMonthlyConfirmOpen(true)}
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
                  {formatCurrency(overview.monthlyIncome, settings.currency)}
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
                  {formatCurrency(overview.totalBudget, settings.currency)}
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
                  {formatCurrency(overview.totalSpent, settings.currency)}
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
                  {formatCurrency(Math.abs(overview.remaining), settings.currency)}
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
                    ? `${formatCurrency(overview.remaining, settings.currency)} ${t('budget.remaining').toLowerCase()}`
                    : `${formatCurrency(Math.abs(overview.remaining), settings.currency)} ${t('budget.overBudget').toLowerCase()}`}
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

          {/* B. Budget Health Badge & Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
              overview.healthStatus === 'over_budget'
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                : overview.healthStatus === 'watch_spending'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  overview.healthStatus === 'over_budget'
                    ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                    : overview.healthStatus === 'watch_spending'
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {overview.healthStatus === 'over_budget' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : overview.healthStatus === 'watch_spending' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {overview.healthStatus === 'over_budget'
                      ? t('budget.overBudget')
                      : overview.healthStatus === 'watch_spending'
                      ? t('budget.watchSpending')
                      : t('budget.onTrack')}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40">
                    {overview.percentageUsed}%
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  {overview.healthStatus === 'over_budget'
                    ? t('budget.healthOverDesc')
                    : overview.healthStatus === 'watch_spending'
                    ? t('budget.healthWatchDesc')
                    : t('budget.healthOnTrackDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* C. Category Budgets Section */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('budget.categoryBudgets')}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {overview.categoryBudgets.length} budgeted categories (
                  {formatCurrency(overview.totalAllocatedToCategories, settings.currency)} allocated)
                </p>
              </div>

              {availableForNewBudget.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenAddCategory()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-2xs transition-all self-start sm:self-auto active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('budget.addCategoryBudget')}</span>
                </button>
              )}
            </div>

            {/* List of Category Budgets */}
            {overview.categoryBudgets.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  No categories budgeted yet for this month.
                </p>
                {availableForNewBudget.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddCategory()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('budget.addCategoryBudget')}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.categoryBudgets.map((item) => (
                  <div
                    key={item.categoryId}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isOverBudget
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                    }`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                          <CategoryIcon name={item.categoryIcon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {item.categoryName}
                          </h3>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            Budget: {formatCurrency(item.budgetedAmount, settings.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(item)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryBudgetToDelete(item)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Numerical stats */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Spent: <strong className="text-neutral-900 dark:text-neutral-100">{formatCurrency(item.actualSpent, settings.currency)}</strong>
                        </span>
                        <span
                          className={`font-semibold ${
                            item.isOverBudget
                              ? 'text-rose-600 dark:text-rose-400'
                              : item.percentage >= 80
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </div>

                      <div className="h-2 w-full bg-neutral-200/70 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.isOverBudget
                              ? 'bg-rose-500'
                              : item.percentage >= 80
                              ? 'bg-amber-500'
                              : 'bg-neutral-900 dark:bg-neutral-100'
                          }`}
                          style={{ width: `${Math.min(Math.max(item.percentage, 2), 100)}%` }}
                        />
                      </div>

                      {/* Remaining / Over Indicator */}
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        {item.isOverBudget ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            Over by {formatCurrency(Math.abs(item.remaining), settings.currency)}
                          </span>
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {formatCurrency(item.remaining, settings.currency)} remaining
                          </span>
                        )}
                        <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">
                          of {formatCurrency(item.budgetedAmount, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* D. Unbudgeted Expenses Section (if any transactions exist in unbudgeted categories) */}
          {overview.unbudgetedCategories.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('budget.unbudgetedTitle')}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('budget.unbudgetedDesc')}
                </p>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {overview.unbudgetedCategories.map((item) => (
                  <div
                    key={item.categoryId}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                        <CategoryIcon name={item.categoryIcon} className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.categoryName}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          Spent: {formatCurrency(item.actualSpent, settings.currency)}
                        </p>
                      </div>
                    </div>

                    {item.categoryId > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddCategory(item.categoryId, item.actualSpent)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('budget.setBudget')}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Budget Modal (Create / Edit) */}
      <MonthlyBudgetModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        monthName={monthNames[selectedMonth]}
        year={selectedYear}
        initialTotalBudget={overview.totalBudget}
        currency={settings.currency}
        expenseCategories={expenseCategories}
        existingAllocations={overview.categoryBudgets.map((cb) => ({
          categoryId: cb.categoryId,
          amount: cb.budgetedAmount,
        }))}
        onSave={async (totalBudget, categoryAllocations) => {
          await saveMonthlyBudget(totalBudget, categoryAllocations);
        }}
      />

      {/* Category Budget Modal (Add / Edit) */}
      <CategoryBudgetModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        currency={settings.currency}
        availableCategories={
          editingCategoryStatus
            ? expenseCategories.filter((c) => c.id === editingCategoryStatus.categoryId)
            : availableForNewBudget
        }
        initialCategoryId={preselectedCatId}
        initialAmount={prefilledAmount}
        isEditing={!!editingCategoryStatus}
        onSave={async (categoryId, amount) => {
          await saveCategoryBudget(categoryId, amount);
        }}
      />

      {/* Delete Monthly Budget Confirmation Dialog */}
      {isDeleteMonthlyConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {t('budget.deleteConfirmTitle')}
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('budget.deleteConfirmBody')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteMonthlyConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMonthly}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Budget Confirmation Dialog */}
      {categoryBudgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {t('budget.deleteCategoryBudget')}
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('budget.deleteCategoryConfirm', {
                category: categoryBudgetToDelete.categoryName,
              })}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryBudgetToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
