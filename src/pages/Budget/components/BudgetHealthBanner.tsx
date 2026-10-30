import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageProvider.tsx';
import type { MonthlyBudgetOverview } from '../../../types.ts';

interface BudgetHealthBannerProps {
  overview: Pick<MonthlyBudgetOverview, 'healthStatus' | 'percentageUsed'>;
}

export function BudgetHealthBanner({ overview }: BudgetHealthBannerProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
        overview.healthStatus === 'over_budget'
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
          : overview.healthStatus === 'watch_spending'
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            overview.healthStatus === 'over_budget'
              ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
              : overview.healthStatus === 'watch_spending'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {overview.healthStatus === 'over_budget' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : overview.healthStatus === 'watch_spending' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {overview.healthStatus === 'over_budget'
                ? t('budget.overBudget')
                : overview.healthStatus === 'watch_spending'
                  ? t('budget.watchSpending')
                  : t('budget.onTrack')}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40">
              {overview.percentageUsed}%
            </span>
          </div>
          <p className="text-xs opacity-90 mt-0.5">
            {overview.healthStatus === 'over_budget'
              ? t('budget.healthOverDesc')
              : overview.healthStatus === 'watch_spending'
                ? t('budget.healthWatchDesc')
                : t('budget.healthOnTrackDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
