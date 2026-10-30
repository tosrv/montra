import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency.ts';
import { CategoryIcon } from '../../../components/ui/CategoryIcon.tsx';
import { useLanguage } from '../../../i18n/LanguageProvider.tsx';
import type { BudgetCategoryStatus } from '../../../types.ts';

interface CategoryBudgetCardProps {
  item: BudgetCategoryStatus;
  currency: string;
  onEdit: (item: BudgetCategoryStatus) => void;
  onDelete: (item: BudgetCategoryStatus) => void;
}

export function CategoryBudgetCard({ item, currency, onEdit, onDelete }: CategoryBudgetCardProps) {
  const { t } = useLanguage();

  return (
    <div
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
              Budget: {formatCurrency(item.budgetedAmount, currency)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            title={t('common.edit')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
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
            Spent:{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {formatCurrency(item.actualSpent, currency)}
            </strong>
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
              Over by {formatCurrency(Math.abs(item.remaining), currency)}
            </span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              {formatCurrency(item.remaining, currency)} remaining
            </span>
          )}
          <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">
            of {formatCurrency(item.budgetedAmount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
