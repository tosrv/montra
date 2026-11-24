import React from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.ts';
import { CategoryIcon } from '../../../components/ui/CategoryIcon.tsx';
import { useLanguage } from '../../../i18n/LanguageProvider.tsx';
import type { MonthlyBudgetOverview } from '../../../types.ts';

interface UnbudgetedExpensesProps {
  items: MonthlyBudgetOverview['unbudgetedCategories'];
  currency: string;
  onSetBudget: (categoryId: number, suggestedAmount: number) => void;
}

export function UnbudgetedExpenses({ items, currency, onSetBudget }: UnbudgetedExpensesProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl space-y-4">
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          {t('budget.unbudgetedTitle')}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {t('budget.unbudgetedDesc')}
        </p>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((item) => (
          <div key={item.categoryId} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                <CategoryIcon name={item.categoryIcon} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.categoryName}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  Spent: {formatCurrency(item.actualSpent, currency)}
                </p>
              </div>
            </div>

            {item.categoryId > 0 && (
              <button
                type="button"
                onClick={() => onSetBudget(item.categoryId, item.actualSpent)}
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
  );
}
