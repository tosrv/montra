import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check } from 'lucide-react';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency.ts';
import { getTodayDateString } from '../../utils/dates.ts';
import type { Account, Category, Transaction, TransactionType } from '../../types.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    accountId: number;
    destinationAccountId?: number;
    categoryId?: number;
    description: string;
    date: string;
  }) => Promise<void>;
  transactionToEdit?: Transaction | null;
  accounts: Account[];
  categories: Category[];
  currencyCode: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  accounts,
  categories,
  currencyCode,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 0);
  const [destinationAccountId, setDestinationAccountId] = useState<number>(accounts[1]?.id || 0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountRaw(transactionToEdit.amount.toString());
      setAccountId(transactionToEdit.accountId);
      setDestinationAccountId(transactionToEdit.destinationAccountId || accounts[1]?.id || 0);
      setCategoryId(transactionToEdit.categoryId);
      setDescription(transactionToEdit.description || '');
      setDate(transactionToEdit.date || getTodayDateString());
    } else {
      setType('expense');
      setAmountRaw('');
      setAccountId(accounts[0]?.id || 0);
      setDestinationAccountId(accounts[1]?.id || accounts[0]?.id || 0);
      setDescription('');
      setDate(getTodayDateString());
      // pick first category
      const expCat = categories.find((c) => c.type === 'expense');
      setCategoryId(expCat?.id);
    }
    setError(null);
  }, [transactionToEdit, isOpen, accounts, categories]);

  // Adjust default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setError(null);
    if (newType !== 'transfer') {
      const match = categories.find((c) => c.type === newType);
      setCategoryId(match?.id);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const numericAmount = parseCurrencyInput(amountRaw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numericAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    if (type === 'transfer') {
      if (!destinationAccountId) {
        setError('Please select a destination account.');
        return;
      }
      if (accountId === destinationAccountId) {
        setError('Source and destination accounts cannot be identical.');
        return;
      }
    } else {
      if (!categoryId) {
        setError('Please select a category.');
        return;
      }
    }

    try {
      setSubmitting(true);
      await onSubmit({
        type,
        amount: numericAmount,
        accountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        description: description.trim(),
        date,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="transaction-modal"
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {transactionToEdit ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-rose-700 dark:text-rose-100 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Type Segmented Controls */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-neutral-900 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                type === 'transfer'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
              Transfer
            </button>
          </div>

          {/* Amount Display & Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative">
              <input
                id="transaction-amount-input"
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amountRaw ? parseInt(amountRaw, 10).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  setAmountRaw(cleaned);
                }}
                className="w-full text-2xl font-bold px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">
                {currencyCode}
              </div>
            </div>
            {numericAmount > 0 && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {formatCurrency(numericAmount, currencyCode)}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              id="transaction-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent transition-all"
            />
          </div>

          {/* Account(s) Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  From Account
                </label>
                <select
                  id="transaction-source-account"
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  To Destination Account
                </label>
                <select
                  id="transaction-destination-account"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Account
                </label>
                <select
                  id="transaction-account-select"
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  id="transaction-category-select"
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                >
                  {filteredCategories.length === 0 && (
                    <option value="">No {type} categories</option>
                  )}
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Description / Note (Optional)
            </label>
            <input
              id="transaction-description-input"
              type="text"
              placeholder="e.g. Lunch with team, Groceries, Client invoice"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-transaction-button"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
