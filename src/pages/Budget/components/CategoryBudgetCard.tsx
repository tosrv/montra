import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
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
              {t('budget.vsBudget')}: {formatCurrency(item.budgetedAmount, currency)}
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

      {/* Status badge + numbers (the comparison bar lives in the Budget vs. spent chart) */}
      <div className="flex items-end justify-between gap-3">
        <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <span>{t('budget.spent')}</span>
          <span>{item.isOverBudget ? t('budget.overBudget') : t('budget.remaining')}</span>
          <span className="text-xs font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
            {formatCurrency(item.actualSpent, currency)}
          </span>
          <span
            className={`text-xs font-bold tabular-nums ${
              item.isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {formatCurrency(Math.abs(item.remaining), currency)}
          </span>
        </div>

        <StatusBadge item={item} />
      </div>
    </div>
  );
}

function StatusBadge({ item }: { item: BudgetCategoryStatus }) {
  const { t } = useLanguage();
  const status = item.isOverBudget
    ? {
        label: t('budget.overBudget'),
        Icon: AlertTriangle,
        className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
      }
    : item.percentage >= 80
      ? {
          label: t('budget.watchSpending'),
          Icon: AlertCircle,
          className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
        }
      : {
          label: t('budget.onTrack'),
          Icon: CheckCircle2,
          className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
        };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${status.className}`}
    >
      <status.Icon className="w-3 h-3" />
      <span>{status.label}</span>
      <span className="tabular-nums opacity-80">{item.percentage}%</span>
    </span>
  );
}
