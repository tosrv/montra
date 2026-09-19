import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tags,
  Settings,
  Plus,
} from 'lucide-react';
import { AppSidebar } from './AppSidebar.tsx';
import { TransactionModal } from '../transactions/TransactionModal.tsx';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { useCategories } from '../../hooks/useCategories.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { createTransaction } from '../../services/transactionService.ts';
import { initializeDatabase } from '../../db/database.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { PWAInstallButton } from '../pwa/PWAInstallButton.tsx';

export function AppLayout() {
  const { t } = useLanguage();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const { accounts, refreshAccounts } = useAccounts();
  const { categories, refreshCategories } = useCategories();
  const { settings } = useSettings();

  // Wait for IndexedDB seed before rendering workspace (critical for direct /app loads)
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await initializeDatabase();
        await Promise.all([refreshAccounts(), refreshCategories()]);
      } catch (e) {
        console.error('Failed to initialize app database:', e);
      } finally {
        if (!cancelled) setDbReady(true);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshAccounts, refreshCategories]);

  const handleCreateTransaction = async (data: any) => {
    await createTransaction(data);
    refreshAccounts();
    window.dispatchEvent(new CustomEvent('money-tracker-tx-changed'));
  };

  const mobileNavItems = [
    { to: '/app', labelKey: 'app.nav.dashboard' as const, icon: LayoutDashboard, end: true },
    { to: '/app/transactions', labelKey: 'app.nav.transactions' as const, icon: Receipt },
    { to: '/app/accounts', labelKey: 'app.nav.accounts' as const, icon: Wallet },
    { to: '/app/categories', labelKey: 'app.nav.categories' as const, icon: Tags },
  ];

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 flex items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar onOpenAddTransaction={() => setIsAddTxOpen(true)} />
      </div>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
            MT
          </div>
          <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">{t('brand.name')}</span>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton variant="navbar" />
          <Link
            to="/app/settings"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label={t('app.nav.settings')}
            title={t('app.nav.settings')}
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 pb-28 md:pb-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet context={{ onOpenAddTransaction: () => setIsAddTxOpen(true) }} />
        </div>
      </main>

      {/* Mobile FAB — above bottom nav */}
      <button
        type="button"
        onClick={() => setIsAddTxOpen(true)}
        className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-lg flex items-center justify-center hover:bg-neutral-800 dark:hover:bg-white active:scale-95 transition-all"
        aria-label={t('app.addTransaction')}
        title={t('app.addTransaction')}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 pt-2 pb-5 shadow-lg">
        {mobileNavItems.map((item) => {
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
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{t(item.labelKey)}</span>
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
