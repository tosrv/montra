import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import type { Category } from '../../types.ts';

interface MonthlyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
  year: number;
  initialTotalBudget: number;
  currency: string;
  expenseCategories: Category[];
  existingAllocations?: { categoryId: number; amount: number }[];
  onSave: (
    totalBudget: number,
    categoryAllocations?: { categoryId: number; amount: number }[]
  ) => Promise<void>;
}

export function MonthlyBudgetModal({
  isOpen,
  onClose,
  monthName,
  year,
  initialTotalBudget,
  currency,
  expenseCategories,
  existingAllocations = [],
  onSave,
}: MonthlyBudgetModalProps) {
  const { t } = useLanguage();
  const [totalBudgetStr, setTotalBudgetStr] = useState(
    initialTotalBudget > 0 ? String(initialTotalBudget) : ''
  );
  const [allocations, setAllocations] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const alloc of existingAllocations) {
      map[alloc.categoryId] = String(alloc.amount);
    }
    return map;
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalBudgetNum = Number(totalBudgetStr.replace(/\D/g, '')) || 0;

  const totalAllocated = Object.entries(allocations).reduce((sum, [, val]) => {
    const n = Number(String(val).replace(/\D/g, '')) || 0;
    return sum + n;
  }, 0);

  const handleCategoryAmountChange = (catId: number, val: string) => {
    setAllocations((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  const handleAutoSumCategories = () => {
    if (totalAllocated > 0) {
      setTotalBudgetStr(String(totalAllocated));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBudgetNum <= 0) {
      setError(
        t('categories.nameRequired')
          ? 'Please enter a valid budget amount.'
          : 'Enter a valid amount'
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const categoryAllocList: { categoryId: number; amount: number }[] = [];
      for (const [catIdStr, valStr] of Object.entries(allocations)) {
        const amt = Number(String(valStr).replace(/\D/g, '')) || 0;
        if (amt > 0) {
          categoryAllocList.push({
            categoryId: Number(catIdStr),
            amount: amt,
          });
        }
      }

      await onSave(totalBudgetNum, categoryAllocList);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {initialTotalBudget > 0 ? t('budget.editMonthly') : t('budget.createBtn')}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {monthName} {year}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 text-xs text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                {error}
              </div>
            )}

            {/* Total Budget Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  {t('budget.totalBudgetLabel')} ({currency})
                </label>
                {totalAllocated > 0 && totalBudgetNum !== totalAllocated && (
                  <button
                    type="button"
                    onClick={handleAutoSumCategories}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 underline"
                  >
                    Match categories ({formatCurrency(totalAllocated, currency)})
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="e.g. 8000000"
                value={totalBudgetStr}
                onChange={(e) => setTotalBudgetStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                {t('budget.totalBudgetHint')}
              </p>
            </div>

            {/* Optional Category Allocations */}
            {expenseCategories.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    {t('budget.categoryBudgets')} (Optional)
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t('budget.allocated')}:{' '}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(totalAllocated, currency)}
                    </span>
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {expenseCategories.map((cat) => {
                    const val = allocations[cat.id!] || '';
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-800"
                      >
                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                          {cat.name}
                        </span>
                        <div className="w-36 shrink-0">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            value={val}
                            onChange={(e) => handleCategoryAmountChange(cat.id!, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-right bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-2xs transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? t('common.loading') : t('common.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
