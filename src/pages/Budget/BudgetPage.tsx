import React, { useState } from 'react';
import { Plus, Trash2, CircleDollarSign, Copy } from 'lucide-react';
import { useBudget } from '../../hooks/useBudget.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatMonthYear, getMonthNames } from '../../utils/dates.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { MonthNavigator } from '../../components/ui/MonthNavigator.tsx';
import {
  AmountVisibilityToggle,
  useAmountVisibility,
} from '../../components/ui/AmountVisibility.tsx';
import { MonthlyBudgetModal } from './MonthlyBudgetModal.tsx';
import { CategoryBudgetModal } from './CategoryBudgetModal.tsx';
import { BudgetSummaryCard } from './components/BudgetSummaryCard.tsx';
import { BudgetHealthBanner } from './components/BudgetHealthBanner.tsx';
import { CategoryBudgetCard } from './components/CategoryBudgetCard.tsx';
import { UnbudgetedExpenses } from './components/UnbudgetedExpenses.tsx';
import type { BudgetCategoryStatus } from '../../types.ts';

export function BudgetPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { expenseCategories } = useCategories();
  const {
    hidden: amountsHidden,
    toggle: toggleAmounts,
    money,
  } = useAmountVisibility(settings.currency);
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    overview,
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
  const [editingCategoryStatus, setEditingCategoryStatus] = useState<BudgetCategoryStatus | null>(
    null
  );
  const [preselectedCatId, setPreselectedCatId] = useState<number | undefined>(undefined);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);

  // Deletion modals
  const [isDeleteMonthlyConfirmOpen, setIsDeleteMonthlyConfirmOpen] = useState(false);
  const [categoryBudgetToDelete, setCategoryBudgetToDelete] = useState<BudgetCategoryStatus | null>(
    null
  );

  const monthNames = getMonthNames();

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AmountVisibilityToggle hidden={amountsHidden} onToggle={toggleAmounts} />

          <MonthNavigator
            year={selectedYear}
            month={selectedMonth}
            onChange={(year, month) => {
              setSelectedYear(year);
              setSelectedMonth(month);
            }}
          />
        </div>
      </div>

      {/* 2. Empty State when no budget exists for this month */}
      {!overview.hasBudget ? (
        <div className="bg-white dark:bg-neutral-900 p-8 sm:p-12 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto shadow-2xs">
            <CircleDollarSign className="w-7 h-7" />
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
                {money(overview.totalSpent)}
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
          <BudgetSummaryCard
            overview={overview}
            money={money}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onEdit={() => setIsMonthlyModalOpen(true)}
            onDelete={() => setIsDeleteMonthlyConfirmOpen(true)}
          />

          <BudgetHealthBanner overview={overview} />

          {/* C. Category Budgets Section */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('budget.categoryBudgets')}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {overview.categoryBudgets.length} budgeted categories (
                  {money(overview.totalAllocatedToCategories)} allocated)
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
                  <CategoryBudgetCard
                    key={item.categoryId}
                    item={item}
                    currency={settings.currency}
                    onEdit={handleOpenEditCategory}
                    onDelete={setCategoryBudgetToDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {overview.unbudgetedCategories.length > 0 && (
            <UnbudgetedExpenses
              items={overview.unbudgetedCategories}
              currency={settings.currency}
              onSetBudget={handleOpenAddCategory}
            />
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

      {isDeleteMonthlyConfirmOpen && (
        <ConfirmDialog
          title={t('budget.deleteConfirmTitle')}
          cancelLabel={t('common.cancel')}
          confirmLabel={t('common.delete')}
          onCancel={() => setIsDeleteMonthlyConfirmOpen(false)}
          onConfirm={handleConfirmDeleteMonthly}
        >
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {t('budget.deleteConfirmBody')}
          </p>
        </ConfirmDialog>
      )}

      {categoryBudgetToDelete && (
        <ConfirmDialog
          title={t('budget.deleteCategoryBudget')}
          icon={Trash2}
          cancelLabel={t('common.cancel')}
          confirmLabel={t('common.delete')}
          onCancel={() => setCategoryBudgetToDelete(null)}
          onConfirm={handleConfirmDeleteCategory}
        >
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {t('budget.deleteCategoryConfirm', { category: categoryBudgetToDelete.categoryName })}
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
