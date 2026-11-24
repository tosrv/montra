import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Wallet,
  Building2,
  Banknote,
  Layers,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { parseCurrencyInput } from '../../utils/currency.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { useAmountVisibility } from '../../components/ui/AmountVisibility.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import type { AccountType, AccountWithBalance } from '../../types.ts';
import { useSheetDrag } from '../../hooks/useSheetDrag.ts';

function accountTypeLabel(type: AccountType, t: ReturnType<typeof useLanguage>['t']) {
  switch (type) {
    case 'bank':
      return t('accounts.typeBank');
    case 'cash':
      return t('accounts.typeCash');
    default:
      return t('accounts.typeOther');
  }
}

export function AccountsPage() {
  const { t } = useLanguage();
  const { accounts, addAccount, editAccount, removeAccount } = useAccounts();
  const { settings } = useSettings();
  const { money } = useAmountVisibility(settings.currency);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const sheetRef = useSheetDrag(() => setIsModalOpen(false));
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalanceStr, setInitialBalanceStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [accountToDelete, setAccountToDelete] = useState<AccountWithBalance | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setInitialBalanceStr('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (acc: AccountWithBalance) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalanceStr(acc.initialBalance ? acc.initialBalance.toString() : '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('accounts.nameRequired'));
      return;
    }

    const initBal = parseCurrencyInput(initialBalanceStr);

    try {
      if (editingAccount?.id) {
        await editAccount(editingAccount.id, {
          name: name.trim(),
          type,
          initialBalance: initBal,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          initialBalance: initBal,
        });
      }
      setIsModalOpen(false);
      window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
    } catch (err: any) {
      setError(err?.message || t('accounts.saveFailed'));
    }
  };

  const handleDelete = async (force: boolean = false) => {
    if (!accountToDelete?.id) return;
    try {
      await removeAccount(accountToDelete.id, force);
      setAccountToDelete(null);
      setDeleteError(null);
      window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
    } catch (err: any) {
      setDeleteError(err?.message || t('accounts.deleteFailed'));
    }
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'bank':
        return Building2;
      case 'cash':
        return Banknote;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Link
        to="/app/settings"
        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>{t('app.nav.settings')}</span>
      </Link>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {t('accounts.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('accounts.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="accounts-add-btn"
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('accounts.new')}</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 p-12 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('accounts.emptyTitle')}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              {t('accounts.emptyHint')}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('accounts.addFirst')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            return (
              <div
                key={acc.id}
                className="bg-white dark:bg-neutral-900 p-4 rounded-2xl flex items-center justify-between gap-3 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {acc.name}
                    </h3>
                    <span className="text-[10px] text-neutral-400">
                      {accountTypeLabel(acc.type, t)} · {money(acc.currentBalance)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(acc)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title={t('accounts.edit')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountToDelete(acc);
                      setDeleteError(null);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t('accounts.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs">
          <div
            ref={sheetRef}
            className="sheet w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingAccount ? t('accounts.modalEdit') : t('accounts.modalNew')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs text-rose-700 dark:text-rose-100 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  {t('accounts.name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('accounts.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  {t('accounts.type')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bank', 'cash', 'other'] as AccountType[]).map((accType) => (
                    <button
                      key={accType}
                      type="button"
                      onClick={() => setType(accType)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        type === accType
                          ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs'
                          : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {accountTypeLabel(accType, t)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  {t('accounts.initialBalanceField', { currency: settings.currency })}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={
                    initialBalanceStr ? parseInt(initialBalanceStr, 10).toLocaleString('id-ID') : ''
                  }
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setInitialBalanceStr(cleaned);
                  }}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  {t('accounts.initialHint')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Safety Guard */}
      {accountToDelete && (
        <ConfirmDialog
          title={t('accounts.deleteConfirmTitle')}
          cancelLabel={t('common.cancel')}
          confirmLabel={
            accountToDelete.transactionCount > 0 ? t('accounts.deleteForce') : t('common.delete')
          }
          onCancel={() => setAccountToDelete(null)}
          onConfirm={() => handleDelete(accountToDelete.transactionCount > 0)}
        >
          {accountToDelete.transactionCount > 0 ? (
            <p className="text-xs p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl">
              {t('accounts.deleteForceHint')}
            </p>
          ) : (
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {t('accounts.deleteConfirmBody')}
            </p>
          )}

          {deleteError && (
            <p className="text-xs text-rose-700 dark:text-rose-100 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              {deleteError}
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
