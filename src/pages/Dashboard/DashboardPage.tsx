import React, { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, ArrowDownRight, ArrowUpRight, Receipt, ArrowRight, Layers } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatDisplayDate } from '../../utils/dates.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { MonthNavigator } from '../../components/ui/MonthNavigator.tsx';
import { useAmountVisibility } from '../../components/ui/AmountVisibility.tsx';
import { CashflowTrendChart } from '../../components/charts/CashflowTrendChart.tsx';
import { CategoryIcon } from '../../components/ui/CategoryIcon.tsx';
import { getMonthlyBudgetOverview } from '../../services/budgetService.ts';
import type { MonthlyBudgetOverview } from '../../types.ts';
import { useAccounts } from '../../hooks/useAccounts.ts';
import { AccountCards } from './components/AccountCards.tsx';

interface AppContext {
  onOpenAddTransaction: () => void;
}

const cardClass = 'bg-white dark:bg-neutral-900 p-5 rounded-2xl';

export function DashboardPage() {
  const { t } = useLanguage();
  const { onOpenAddTransaction } = useOutletContext<AppContext>();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    data,
    cashflowTrend,
    refreshDashboard,
  } = useDashboard();
  const { settings } = useSettings();
  const { accounts, refreshAccounts } = useAccounts();
  const [budget, setBudget] = useState<MonthlyBudgetOverview | null>(null);

  const refreshBudget = useCallback(async () => {
    try {
      setBudget(await getMonthlyBudgetOverview(selectedYear, selectedMonth));
    } catch (e) {
      console.error('Failed to load budget overview:', e);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    void refreshBudget();
  }, [refreshBudget]);

  useEffect(() => {
    const handleTxChanged = () => {
      refreshDashboard();
      void refreshBudget();
      void refreshAccounts();
    };
    window.addEventListener('money-tracker-tx-changed', handleTxChanged);
    return () => {
      window.removeEventListener('money-tracker-tx-changed', handleTxChanged);
    };
  }, [refreshDashboard, refreshBudget, refreshAccounts]);

  const { money } = useAmountVisibility(settings.currency);

  const topExpenses = [...data.expenseBreakdown].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxExpense = topExpenses[0]?.amount || 1;

  const budgetBarColor =
    budget?.healthStatus === 'over_budget'
      ? 'bg-rose-500'
      : budget?.healthStatus === 'watch_spending'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {t('dashboard.title')}
        </h1>
        <div className="flex items-center gap-2">
          <MonthNavigator
            year={selectedYear}
            month={selectedMonth}
            onChange={(year, month) => {
              setSelectedYear(year);
              setSelectedMonth(month);
            }}
          />
        </div>
      </div>

      {/* 1. Balance hero + monthly summary */}
      <div className={`${cardClass} space-y-4`}>
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {t('dashboard.balanceTitle')}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-1">
            {money(data.currentBalance)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="min-w-0">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t('dashboard.income')}
            </p>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              {money(data.monthlyIncome)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t('dashboard.expense')}
            </p>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 truncate">
              {money(data.monthlyExpense)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t('dashboard.net')}
            </p>
            <p
              className={`text-sm font-semibold truncate ${
                data.netCashFlow >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {money(data.netCashFlow)}
            </p>
          </div>
        </div>
      </div>

      {/* Account cards */}
      <AccountCards accounts={accounts} money={money} />

      {/* 2. Budget summary */}
      {budget && (
        <Link
          to="/app/budget"
          className={`${cardClass} block space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('dashboard.budgetTitle')}
            </h2>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </div>
          {budget.hasBudget ? (
            <>
              <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetBarColor}`}
                  style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    budget.remaining < 0
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {budget.remaining < 0
                    ? t('dashboard.budgetOver', { amount: money(-budget.remaining) })
                    : t('dashboard.budgetLeft', { amount: money(budget.remaining) })}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t('dashboard.budgetUsed', {
                    percent: String(budget.percentageUsed),
                    total: money(budget.totalBudget),
                  })}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('dashboard.noBudget')}{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 underline">
                {t('dashboard.setBudget')}
              </span>
            </p>
          )}
        </Link>
      )}

      {/* 3. Top spending categories */}
      {topExpenses.length > 0 && (
        <div className={`${cardClass} space-y-3`}>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('dashboard.topExpenses')}
          </h2>
          <ul className="space-y-3">
            {topExpenses.map((item) => (
              <li key={item.categoryId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 min-w-0 text-neutral-700 dark:text-neutral-300">
                    <CategoryIcon
                      name={item.categoryIcon}
                      className="w-4 h-4 shrink-0 text-neutral-400"
                    />
                    <span className="truncate">{item.categoryName}</span>
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 shrink-0">
                    {money(item.amount)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-400 dark:bg-rose-500"
                    style={{ width: `${(item.amount / maxExpense) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Cash-flow trend */}
      <CashflowTrendChart data={cashflowTrend} currency={settings.currency} />

      {/* 5. Recent transactions */}
      <div className={`${cardClass} space-y-2`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('dashboard.recent')}
          </h2>
          <Link
            to="/app/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <span>{t('dashboard.seeAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('dashboard.noData')}
            </p>
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('dashboard.addFirst')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : tx.type === 'expense'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : tx.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight truncate">
                      {tx.description ||
                        (tx.type === 'transfer'
                          ? t('common.transfer')
                          : t(`common.${tx.type}` as 'common.income' | 'common.expense'))}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {formatDisplayDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold shrink-0 ${
                    tx.type === 'income'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : tx.type === 'expense'
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {money(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
