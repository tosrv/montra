import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Settings,
  Plus,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { AppSidebar } from './AppSidebar.tsx';
import { TransactionModal } from '../transactions/TransactionModal.tsx';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { createTransaction } from '../../services/transactionService.ts';
import { initializeDatabase } from '../../db/database.ts';

export function AppLayout() {
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const location = useLocation();

  const { accounts, refreshAccounts } = useAccounts();
  const { categories, refreshCategories } = useCategories();
  const { settings } = useSettings();

  // Initialize DB once on mount
  useEffect(() => {
    async function init() {
      await initializeDatabase();
      setDbReady(true);
    }
    init();
  }, []);

  const handleCreateTransaction = async (data: any) => {
    await createTransaction(data);
    refreshAccounts();
    // Dispatch custom event so current page (e.g. Dashboard or Transactions) reloads immediately
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
  };

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/transactions', label: 'Transactions', icon: Receipt },
    { to: '/app/accounts', label: 'Accounts', icon: Wallet },
    { to: '/app/categories', label: 'Categories', icon: Tags },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar onOpenAddTransaction={() => setIsAddTxOpen(true)} />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
            MT
          </div>
          <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Money Tracker</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsAddTxOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white hover:bg-neutral-800 rounded-lg shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 pb-20 md:pb-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet context={{ onOpenAddTransaction: () => setIsAddTxOpen(true) }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 py-1.5 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSubmit={handleCreateTransaction}
        accounts={accounts}
        categories={categories}
        currencyCode={settings.currency}
      />
    </div>
  );
}
