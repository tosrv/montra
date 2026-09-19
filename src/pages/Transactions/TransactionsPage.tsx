import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import {
  getFilteredTransactions,
  updateTransaction,
  deleteTransaction,
  createTransaction,
} from '../../services/transactionService.ts';
import { exportTransactionsCsv } from '../../services/backupService.ts';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatCurrency } from '../../utils/currency.ts';
import { formatDisplayDate, getMonthNames } from '../../utils/dates.ts';
import { TransactionModal } from '../../components/transactions/TransactionModal.tsx';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import type { Transaction, TransactionType } from '../../types.ts';

interface AppContext {
  onOpenAddTransaction: () => void;
}

export function TransactionsPage() {
  const { t } = useLanguage();
  const { onOpenAddTransaction } = useOutletContext<AppContext>();
  const { accounts, refreshAccounts } = useAccounts();
  const { categories, refreshCategories } = useCategories();
  const { settings } = useSettings();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [accountFilter, setAccountFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc'
  );

  // Edit modal
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTxs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFilteredTransactions({
        search,
        type: typeFilter,
        categoryId: categoryFilter,
        accountId: accountFilter,
        sortBy,
      });
      setTransactions(data);
    } catch (e) {
      console.error('Failed to query transactions:', e);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, categoryFilter, accountFilter, sortBy]);

  useEffect(() => {
    fetchTxs();
  }, [fetchTxs]);

  // Listen to global add events
  useEffect(() => {
    const handleTxChanged = () => {
      fetchTxs();
      refreshAccounts();
    };
    window.addEventListener('money-tracker-tx-changed', handleTxChanged);
    return () => {
      window.removeEventListener('money-tracker-tx-changed', handleTxChanged);
    };
  }, [fetchTxs, refreshAccounts]);

  const handleEditSubmit = async (data: any) => {
    if (!editingTransaction?.id) return;
    await updateTransaction(editingTransaction.id, data);
    setEditingTransaction(null);
    fetchTxs();
    refreshAccounts();
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await deleteTransaction(deletingId);
    setDeletingId(null);
    fetchTxs();
    refreshAccounts();
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
  };

  const accountMap = new Map(accounts.map((a) => [a.id!, a]));
  const categoryMap = new Map(categories.map((c) => [c.id!, c]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{t('tx.title')}</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('tx.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportTransactionsCsv()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            title={t('tx.exportCsvTitle')}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('tx.exportCsv')}</span>
          </button>

          <button
            id="transactions-add-btn"
            type="button"
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('tx.add')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="transaction-search-input"
              type="text"
              placeholder={t('tx.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent"
            />
          </div>

          {/* Quick Type Filter */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl shrink-0 text-xs">
            {(['all', 'expense', 'income', 'transfer'] as const).map((filterType) => (
              <button
                key={filterType}
                type="button"
                onClick={() => setTypeFilter(filterType)}
                className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  typeFilter === filterType
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {filterType === 'all' ? t('tx.filterAll') : t(`common.${filterType}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          {/* Account selector */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium whitespace-nowrap">{t('tx.account')}:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(Number(e.target.value))}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg py-1.5 px-2 text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
            >
              <option value={0}>{t('tx.allAccounts')}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium whitespace-nowrap">{t('tx.category')}:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(Number(e.target.value))}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg py-1.5 px-2 text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
            >
              <option value={0}>{t('tx.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({t(`common.${cat.type}`)})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By selector */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium whitespace-nowrap">{t('tx.sort')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg py-1.5 px-2 text-neutral-800 dark:text-neutral-100 focus:outline-none cursor-pointer"
            >
              <option value="date_desc">{t('tx.sortDateNewest')}</option>
              <option value="date_asc">{t('tx.sortDateOldest')}</option>
              <option value="amount_desc">{t('tx.sortAmountHigh')}</option>
              <option value="amount_asc">{t('tx.sortAmountLow')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('tx.emptyTitle')}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                {search || typeFilter !== 'all' || categoryFilter !== 0 || accountFilter !== 0
                  ? t('tx.emptyFiltered')
                  : t('tx.emptyHint')}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('tx.add')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {transactions.map((tx) => {
              const account = accountMap.get(tx.accountId);
              const destAccount = tx.destinationAccountId
                ? accountMap.get(tx.destinationAccountId)
                : undefined;
              const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;

              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800'
                          : tx.type === 'expense'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {tx.description ||
                            (tx.type === 'transfer'
                              ? `${account?.name || t('tx.accountFallback')} → ${destAccount?.name || t('tx.accountFallback')}`
                              : t(`common.${tx.type}`))}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            tx.type === 'income'
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                              : tx.type === 'expense'
                              ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                              : 'bg-blue-100/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200'
                          }`}
                        >
                          {t(`common.${tx.type}`)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-300">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          {formatDisplayDate(tx.date)}
                        </span>

                        {tx.type === 'transfer' ? (
                          <span className="text-neutral-600 dark:text-neutral-300">
                            {account?.name} → {destAccount?.name}
                          </span>
                        ) : (
                          <>
                            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                              {account?.name || t('tx.unknownAccount')}
                            </span>
                            {category && (
                              <>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <span className="text-neutral-600 dark:text-neutral-300">{category.name}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, settings.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(tx)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title={t('tx.editTitle')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(tx.id!)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={t('tx.deleteTitle')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleEditSubmit}
          transactionToEdit={editingTransaction}
          accounts={accounts}
          categories={categories}
          currencyCode={settings.currency}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{t('tx.deleteConfirmTitle')}</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {t('tx.deleteConfirmBody')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {t('tx.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
