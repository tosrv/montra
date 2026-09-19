import React, { useState } from 'react';
import {
  Plus,
  Wallet,
  Building2,
  Banknote,
  Layers,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency.ts';
import type { AccountType, AccountWithBalance } from '../../types.ts';

export function AccountsPage() {
  const { accounts, loading, refreshAccounts, addAccount, editAccount, removeAccount } =
    useAccounts();
  const { settings } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setError('Account name is required.');
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
      setError(err?.message || 'Failed to save account.');
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
      setDeleteError(err?.message || 'Failed to delete account.');
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Accounts</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your bank accounts, cash wallets, and balances
          </p>
        </div>

        <button
          id="accounts-add-btn"
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-2xs active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">No accounts yet.</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add your first account to record income and expenses.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add your first account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            return (
              <div
                key={acc.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">{acc.name}</h3>
                        <span className="text-[11px] text-neutral-400 capitalize font-medium">
                          {acc.type} account
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(acc)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountToDelete(acc);
                          setDeleteError(null);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                      Current Balance
                    </span>
                    <div className="text-2xl font-bold text-neutral-900 mt-0.5 tracking-tight">
                      {formatCurrency(acc.currentBalance, settings.currency)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Initial Balance</span>
                    <span className="font-semibold text-neutral-700">
                      {formatCurrency(acc.initialBalance, settings.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transactions</span>
                    <span className="font-semibold text-neutral-700">{acc.transactionCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">
                {editingAccount ? 'Edit Account' : 'New Account'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandiri, GoPay, Savings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bank', 'cash', 'other'] as AccountType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                        type === t
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Initial Balance ({settings.currency})
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
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Starting balance before any recorded transactions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingAccount ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Safety Guard */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Delete Account "{accountToDelete.name}"?
              </h3>
            </div>

            {accountToDelete.transactionCount > 0 ? (
              <div className="space-y-3 text-xs text-neutral-600">
                <p className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
                  <strong>Protected Action:</strong> This account is currently referenced by{' '}
                  <span className="font-bold">{accountToDelete.transactionCount}</span> transaction(s).
                  Deleting this account will remove or alter associated historical transactions.
                </p>
                <p>
                  To preserve data integrity, consider editing the transactions first. If you choose
                  to delete anyway, all associated transactions will be removed.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-600">
                This account has zero transactions and can be safely removed without affecting
                history.
              </p>
            )}

            {deleteError && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(accountToDelete.transactionCount > 0)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {accountToDelete.transactionCount > 0 ? 'Force Delete Account & History' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
