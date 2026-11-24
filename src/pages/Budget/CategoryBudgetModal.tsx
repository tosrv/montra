import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CategoryIcon } from '../../components/ui/CategoryIcon.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import type { Category } from '../../types.ts';
import { useSheetDrag } from '../../hooks/useSheetDrag.ts';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  availableCategories: Category[];
  initialCategoryId?: number;
  initialAmount?: number;
  isEditing?: boolean;
  onSave: (categoryId: number, amount: number) => Promise<void>;
}

export function CategoryBudgetModal({
  isOpen,
  onClose,
  currency,
  availableCategories,
  initialCategoryId,
  initialAmount,
  isEditing = false,
  onSave,
}: CategoryBudgetModalProps) {
  const { t } = useLanguage();
  const sheetRef = useSheetDrag(onClose);
  const [categoryId, setCategoryId] = useState<number>(
    initialCategoryId || (availableCategories[0]?.id ?? 0)
  );
  const [amountStr, setAmountStr] = useState<string>(
    initialAmount && initialAmount > 0 ? String(initialAmount) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    } else if (availableCategories[0]?.id) {
      setCategoryId(availableCategories[0].id);
    }
    if (initialAmount && initialAmount > 0) {
      setAmountStr(String(initialAmount));
    } else {
      setAmountStr('');
    }
    setError(null);
  }, [initialCategoryId, initialAmount, availableCategories, isOpen]);

  if (!isOpen) return null;

  const selectedCategory = availableCategories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amountStr.replace(/\D/g, '')) || 0;

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (amountNum <= 0) {
      setError('Please enter a budget amount greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(categoryId, amountNum);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save category budget.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={sheetRef}
        className="sheet w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? t('budget.editCategoryBudget') : t('budget.addCategoryBudget')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Category Selector / Display */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              {t('budget.category')}
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200">
                  <CategoryIcon name={selectedCategory?.icon} className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedCategory?.name || 'Category'}
                </span>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Budget Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              {t('budget.budgetAmount')} ({currency})
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="e.g. 1500000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-base font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
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
