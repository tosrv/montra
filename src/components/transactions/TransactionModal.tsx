import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Check, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.ts';
import { getTodayDateString } from '../../utils/dates.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import type { Account, Category, Transaction, TransactionType } from '../../types.ts';
import { useSheetDrag } from '../../hooks/useSheetDrag.ts';
import { CategoryIcon } from '../ui/CategoryIcon.tsx';

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

/* ---------- Remembered input preferences (per device, convenience only) ---------- */

const PREFS_KEY = 'montra-tx-input-prefs';

interface InputPrefs {
  type?: TransactionType;
  accountId?: number;
  destinationAccountId?: number;
  categoryByType?: Partial<Record<'income' | 'expense', number>>;
  categoryUsage?: Record<string, number>;
  autoThousands?: boolean;
}

function loadPrefs(): InputPrefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') as InputPrefs;
  } catch {
    return {};
  }
}

function savePrefs(update: (prev: InputPrefs) => InputPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(update(loadPrefs())));
  } catch {
    /* storage unavailable: ignore */
  }
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const THOUSANDS_SUFFIX = '.000';

const labelClass =
  'block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
    active
      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
  }`;

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  accounts,
  categories,
  currencyCode,
}: TransactionModalProps) {
  const { t } = useLanguage();
  const sheetRef = useSheetDrag(onClose);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const thousandsSupported = currencyCode === 'IDR';

  const [type, setType] = useState<TransactionType>('expense');
  /** Digits the user typed. With auto-thousands on, the real amount is base × 1000. */
  const [amountBase, setAmountBase] = useState<string>('');
  const [autoThousands, setAutoThousands] = useState(true);
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 0);
  const [destinationAccountId, setDestinationAccountId] = useState<number>(accounts[1]?.id || 0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [categoryUsage, setCategoryUsage] = useState<Record<string, number>>({});

  const thousandsOn = thousandsSupported && autoThousands;
  const accountExists = (id?: number) => !!id && accounts.some((a) => a.id === id);
  const categoryFits = (id: number | undefined, tp: TransactionType) =>
    !!id && categories.some((c) => c.id === id && c.type === tp);

  const focusAmount = () => {
    // Delay so the sheet is mounted; keeps the numeric keyboard up on mobile when allowed.
    window.setTimeout(() => amountInputRef.current?.focus(), 50);
  };

  // Sync state when editing or opening
  useEffect(() => {
    if (!isOpen) return;
    const prefs = loadPrefs();
    setCategoryUsage(prefs.categoryUsage ?? {});
    const prefersThousands = prefs.autoThousands ?? true;

    if (transactionToEdit) {
      const amt = transactionToEdit.amount;
      const useThousands = prefersThousands && amt % 1000 === 0;
      setAutoThousands(useThousands);
      setAmountBase(String(thousandsSupported && useThousands ? amt / 1000 : amt));
      setType(transactionToEdit.type);
      setAccountId(transactionToEdit.accountId);
      setDestinationAccountId(transactionToEdit.destinationAccountId || accounts[1]?.id || 0);
      setCategoryId(transactionToEdit.categoryId);
      setDescription(transactionToEdit.description || '');
      setDate(transactionToEdit.date || getTodayDateString());
    } else {
      const lastType = prefs.type ?? 'expense';
      setAutoThousands(prefersThousands);
      setAmountBase('');
      setType(lastType);
      const acc = accountExists(prefs.accountId) ? prefs.accountId! : accounts[0]?.id || 0;
      setAccountId(acc);
      const dest = accountExists(prefs.destinationAccountId)
        ? prefs.destinationAccountId!
        : accounts.find((a) => a.id !== acc)?.id || accounts[0]?.id || 0;
      setDestinationAccountId(dest);
      setDescription('');
      setDate(getTodayDateString());
      if (lastType !== 'transfer') {
        const remembered = prefs.categoryByType?.[lastType];
        setCategoryId(
          categoryFits(remembered, lastType)
            ? remembered
            : categories.find((c) => c.type === lastType)?.id
        );
      }
      focusAmount();
    }
    setError(null);
    setSavedFlash(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionToEdit, isOpen, accounts, categories, thousandsSupported]);

  // Keep the caret before the auto ".000" so typing/deleting edits the real digits.
  useLayoutEffect(() => {
    const el = amountInputRef.current;
    if (!el || !thousandsOn || !amountBase || document.activeElement !== el) return;
    const pos = el.value.length - THOUSANDS_SUFFIX.length;
    el.setSelectionRange(pos, pos);
  }, [amountBase, thousandsOn]);

  if (!isOpen) return null;

  const baseNumber = parseInt(amountBase || '0', 10) || 0;
  const numericAmount = thousandsOn ? baseNumber * 1000 : baseNumber;
  const amountDisplay = amountBase ? numericAmount.toLocaleString('id-ID') : '';

  const handleAmountChange = (value: string) => {
    let digits = value.replace(/[^0-9]/g, '');
    if (thousandsOn && amountBase) {
      const prevDigits = String(numericAmount);
      if (digits.endsWith('000') && digits.length > 3) {
        digits = digits.slice(0, -3);
      } else if (digits.length === prevDigits.length - 1) {
        // A trailing zero was deleted: treat it as deleting the last real digit.
        digits = amountBase.slice(0, -1);
      } else if (digits.startsWith(prevDigits)) {
        // Typed after the ".000" (caret moved to the end): append to the real digits.
        digits = amountBase + digits.slice(prevDigits.length);
      } else {
        digits = digits.replace(/000$/, '');
      }
    }
    setAmountBase(digits.replace(/^0+/, ''));
  };

  const toggleThousands = () => {
    const next = !autoThousands;
    // Preserve the current amount when switching modes where possible.
    if (amountBase) {
      if (next) setAmountBase(numericAmount % 1000 === 0 ? String(numericAmount / 1000) : '');
      else setAmountBase(String(numericAmount));
    }
    setAutoThousands(next);
    savePrefs((p) => ({ ...p, autoThousands: next }));
    amountInputRef.current?.focus();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setError(null);
    if (newType !== 'transfer') {
      const remembered = loadPrefs().categoryByType?.[newType];
      setCategoryId(
        categoryFits(remembered, newType)
          ? remembered
          : categories.find((c) => c.type === newType)?.id
      );
    }
  };

  // Most-used categories first, then original order
  const filteredCategories = categories
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type === type)
    .sort(
      (a, b) =>
        (categoryUsage[String(b.c.id)] ?? 0) - (categoryUsage[String(a.c.id)] ?? 0) || a.i - b.i
    )
    .map(({ c }) => c);

  const today = getTodayDateString();
  const yesterday = yesterdayDateString();

  const submit = async (keepOpen: boolean) => {
    setError(null);

    if (numericAmount <= 0) {
      setError(t('tx.modal.errAmount'));
      return;
    }
    if (!accountId) {
      setError(t('tx.modal.errAccount'));
      return;
    }
    if (type === 'transfer') {
      if (!destinationAccountId) {
        setError(t('tx.modal.errDest'));
        return;
      }
      if (accountId === destinationAccountId) {
        setError(t('tx.modal.errSameAccount'));
        return;
      }
    } else if (!categoryId) {
      setError(t('tx.modal.errCategory'));
      return;
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

      if (!transactionToEdit) {
        savePrefs((p) => {
          const usage = { ...(p.categoryUsage ?? {}) };
          if (type !== 'transfer' && categoryId) {
            usage[String(categoryId)] = (usage[String(categoryId)] ?? 0) + 1;
          }
          return {
            ...p,
            type,
            accountId,
            destinationAccountId:
              type === 'transfer' ? destinationAccountId : p.destinationAccountId,
            categoryByType:
              type !== 'transfer' && categoryId
                ? { ...(p.categoryByType ?? {}), [type]: categoryId }
                : p.categoryByType,
            categoryUsage: usage,
          };
        });
      }

      if (keepOpen) {
        // Save & add another: clear amount + note, keep type/account/category/date.
        setAmountBase('');
        setDescription('');
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1500);
        amountInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || t('tx.modal.errSave'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(false);
  };

  const typeButton = (
    value: TransactionType,
    label: string,
    icon: React.ReactNode,
    active: string
  ) => (
    <button
      type="button"
      onClick={() => handleTypeChange(value)}
      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
        type === value
          ? `bg-white dark:bg-neutral-900 shadow-xs ${active}`
          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const accountChips = (selected: number, onSelect: (id: number) => void, idPrefix: string) => (
    <div className="flex flex-wrap gap-1.5" id={idPrefix}>
      {accounts.map((acc) => (
        <button
          key={acc.id}
          type="button"
          onClick={() => onSelect(acc.id!)}
          aria-pressed={selected === acc.id}
          className={chipClass(selected === acc.id)}
        >
          {acc.name}
        </button>
      ))}
    </div>
  );

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        id="transaction-modal"
        className="sheet w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {transactionToEdit ? t('tx.modal.edit') : t('tx.modal.new')}
          </h2>
          <div className="flex items-center gap-2">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                {t('tx.modal.saved')}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
            {typeButton(
              'expense',
              t('common.expense'),
              <ArrowUpRight className="w-4 h-4 text-rose-500" />,
              'text-rose-700 dark:text-rose-300'
            )}
            {typeButton(
              'income',
              t('common.income'),
              <ArrowDownRight className="w-4 h-4 text-emerald-500" />,
              'text-emerald-700 dark:text-emerald-300'
            )}
            {typeButton(
              'transfer',
              t('common.transfer'),
              <ArrowLeftRight className="w-4 h-4 text-neutral-500" />,
              'text-neutral-900 dark:text-neutral-100'
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="transaction-amount-input" className={`${labelClass} mb-0`}>
                {t('tx.modal.amount')}
              </label>
              {thousandsSupported && (
                <button
                  type="button"
                  onClick={toggleThousands}
                  aria-pressed={autoThousands}
                  title={t('tx.modal.autoThousands')}
                  className={chipClass(autoThousands).replace('px-3 py-1.5', 'px-2 py-0.5')}
                >
                  000
                </button>
              )}
            </div>
            <div className="relative">
              <input
                ref={amountInputRef}
                id="transaction-amount-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                required
                placeholder="0"
                value={amountDisplay}
                onChange={(e) => handleAmountChange(e.target.value)}
                onFocus={(e) => {
                  if (!thousandsOn || !amountBase) return;
                  const el = e.currentTarget;
                  window.setTimeout(() => {
                    const pos = el.value.length - THOUSANDS_SUFFIX.length;
                    el.setSelectionRange(pos, pos);
                  }, 0);
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

          {/* Category grid (income / expense) */}
          {type !== 'transfer' && (
            <div>
              <span className={labelClass}>{t('tx.modal.category')}</span>
              {filteredCategories.length === 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('tx.modal.noCategories', { type: t(`common.${type}`) })}
                </p>
              ) : (
                <div id="transaction-category-grid" className="grid grid-cols-4 gap-2">
                  {filteredCategories.map((cat) => {
                    const active = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-colors ${
                          active
                            ? type === 'expense'
                              ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'border-transparent bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5" />
                        <span className="text-[10px] font-medium leading-tight line-clamp-2 break-words w-full">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Account(s) */}
          {type === 'transfer' ? (
            <div className="space-y-3">
              <div>
                <span className={labelClass}>{t('tx.modal.fromAccount')}</span>
                {accountChips(accountId, setAccountId, 'transaction-source-account')}
              </div>
              <div>
                <span className={labelClass}>{t('tx.modal.toAccount')}</span>
                {accountChips(
                  destinationAccountId,
                  setDestinationAccountId,
                  'transaction-destination-account'
                )}
              </div>
            </div>
          ) : (
            <div>
              <span className={labelClass}>{t('tx.modal.account')}</span>
              {accountChips(accountId, setAccountId, 'transaction-account-select')}
            </div>
          )}

          {/* Date: quick chips + picker */}
          <div>
            <label htmlFor="transaction-date-input" className={labelClass}>
              {t('tx.modal.date')}
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDate(today)}
                className={chipClass(date === today)}
              >
                {t('tx.modal.today')}
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterday)}
                className={chipClass(date === yesterday)}
              >
                {t('tx.modal.yesterday')}
              </button>
              <input
                id="transaction-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="transaction-description-input" className={labelClass}>
              {t('tx.modal.description')}
            </label>
            <input
              id="transaction-description-input"
              type="text"
              placeholder={t('tx.modal.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {transactionToEdit ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                {t('common.cancel')}
              </button>
            ) : (
              <button
                id="save-and-new-transaction-button"
                type="button"
                disabled={submitting}
                onClick={() => void submit(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('tx.modal.saveAndNew')}
              </button>
            )}
            <button
              id="save-transaction-button"
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              {submitting ? t('tx.modal.saving') : t('tx.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
