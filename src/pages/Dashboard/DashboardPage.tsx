import React, { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { formatCurrency } from '../../utils/currency.ts';
import { formatMonthYear, formatDisplayDate } from '../../utils/dates.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { MonthNavigator } from '../../components/ui/MonthNavigator.tsx';
import {
  AmountVisibilityToggle,
  useAmountVisibility,
} from '../../components/ui/AmountVisibility.tsx';
import { CashflowTrendChart } from '../../components/charts/CashflowTrendChart.tsx';
import { BalanceTrendChart } from '../../components/charts/BalanceTrendChart.tsx';
import { ExpenseDonutChart } from '../../components/charts/ExpenseDonutChart.tsx';

interface AppContext {
  onOpenAddTransaction: () => void;
}

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
    balanceSeries,
    refreshDashboard,
  } = useDashboard();
  const { settings } = useSettings();

  useEffect(() => {
    const handleTxChanged = () => {
      refreshDashboard();
    };
    window.addEventListener('money-tracker-tx-changed', handleTxChanged);
    return () => {
      window.removeEventListener('money-tracker-tx-changed', handleTxChanged);
    };
  }, [refreshDashboard]);

  const {
    hidden: amountsHidden,
    toggle: toggleAmounts,
    money,
  } = useAmountVisibility(settings.currency);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Month & Year Navigator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AmountVisibilityToggle hidden={amountsHidden} onToggle={toggleAmounts} />
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

      {/* 1 to 4: Metric Blocks in requested priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Current Balance (Overall) */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('app.nav.accounts')}
            </span>
            <Wallet className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {money(data.currentBalance)}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>

        {/* 2. Monthly Income */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('dashboard.income')}
            </span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {money(data.monthlyIncome)}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>

        {/* 3. Monthly Expense */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('dashboard.expense')}
            </span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
            {money(data.monthlyExpense)}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>

        {/* 4. Net Cash Flow */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t('dashboard.net')}
            </span>
            {data.netCashFlow >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold tracking-tight ${
              data.netCashFlow >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {money(data.netCashFlow)}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatMonthYear(selectedYear, selectedMonth)}
          </p>
        </div>
      </div>

      {/* Cash-flow charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CashflowTrendChart data={cashflowTrend} currency={settings.currency} />
        <BalanceTrendChart
          data={balanceSeries}
          currency={settings.currency}
          year={selectedYear}
          month={selectedMonth}
        />
      </div>

      {/* 5. Add Transaction Banner / Action */}
      <div className="p-4 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="text-center sm:text-left">
          <h3 className="text-sm font-semibold">{t('app.addTransaction')}</h3>
          <p className="text-xs text-neutral-300 mt-0.5">{t('dashboard.addFirst')}</p>
        </div>
        <button
          id="dashboard-add-tx-btn"
          type="button"
          onClick={onOpenAddTransaction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-white rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('app.addTransaction')}</span>
        </button>
      </div>

      {/* 6. Expense Breakdown */}
      <ExpenseDonutChart
        items={data.expenseBreakdown}
        total={data.monthlyExpense}
        currency={settings.currency}
        description={formatMonthYear(selectedYear, selectedMonth)}
      />

      {/* 7. Recent Transactions for the Month */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {t('app.nav.transactions')}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatMonthYear(selectedYear, selectedMonth)}
            </p>
          </div>
          <Link
            to="/app/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline"
          >
            <span>{t('app.nav.transactions')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('dashboard.noData')}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                {t('dashboard.addFirst')}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('app.addTransaction')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : tx.type === 'expense'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
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
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
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

                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
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
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 capitalize">
                    {tx.type === 'income'
                      ? t('common.income')
                      : tx.type === 'expense'
                        ? t('common.expense')
                        : t('common.transfer')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
