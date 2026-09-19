import { useState, useEffect, useCallback } from 'react';
import { getAccountsWithBalances, createAccount, updateAccount, deleteAccount } from '../services/accountService.ts';
import type { AccountWithBalance, AccountType } from '../types.ts';

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccountsWithBalances();
      setAccounts(data);
    } catch (e) {
      console.error('Failed to load accounts:', e);
      setError('Could not load accounts from local database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (data: { name: string; type: AccountType; initialBalance: number }) => {
    await createAccount(data);
    await fetchAccounts();
  };

  const editAccount = async (
    id: number,
    data: { name: string; type: AccountType; initialBalance: number }
  ) => {
    await updateAccount(id, data);
    await fetchAccounts();
  };

  const removeAccount = async (id: number, force?: boolean) => {
    const res = await deleteAccount(id, force);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete account');
    }
    await fetchAccounts();
  };

  return {
    accounts,
    loading,
    error,
    refreshAccounts: fetchAccounts,
    addAccount,
    editAccount,
    removeAccount,
  };
}
