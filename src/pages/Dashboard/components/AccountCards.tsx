import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Banknote, Layers, Plus, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageProvider.tsx';
import type { AccountType, AccountWithBalance } from '../../../types.ts';

interface AccountCardsProps {
  accounts: AccountWithBalance[];
  money: (amount: number) => string;
}

const typeStyle: Record<AccountType, { icon: typeof Building2; bg: string }> = {
  bank: {
    icon: Building2,
    bg: 'from-neutral-800 to-neutral-950 dark:from-neutral-700 dark:to-neutral-900',
  },
  cash: {
    icon: Banknote,
    bg: 'from-emerald-700 to-emerald-900',
  },
  other: {
    icon: Layers,
    bg: 'from-stone-500 to-stone-700',
  },
};

/** Horizontally scrollable account "cards" for the dashboard. */
export function AccountCards({ accounts, money }: AccountCardsProps) {
  const { t } = useLanguage();

  const typeLabel = (type: AccountType) =>
    type === 'bank'
      ? t('accounts.typeBank')
      : type === 'cash'
        ? t('accounts.typeCash')
        : t('accounts.typeOther');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          {t('app.nav.accounts')}
        </h2>
        <Link
          to="/app/accounts"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <span>{t('settings.manageTitle')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {accounts.map((acc) => {
          const style = typeStyle[acc.type] ?? typeStyle.other;
          const Icon = style.icon;
          return (
            <Link
              key={acc.id}
              to="/app/accounts"
              className={`snap-start shrink-0 w-56 h-32 rounded-2xl p-4 bg-linear-to-br ${style.bg} text-white flex flex-col justify-between shadow-sm active:scale-[0.98] transition-transform`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{acc.name}</p>
                  <p className="text-[11px] text-white/70">{typeLabel(acc.type)}</p>
                </div>
                <Icon className="w-5 h-5 text-white/80 shrink-0" />
              </div>
              <p className="text-xl font-bold tracking-tight truncate">
                {money(acc.currentBalance)}
              </p>
            </Link>
          );
        })}

        <Link
          to="/app/accounts"
          className="snap-start shrink-0 w-32 h-32 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 flex flex-col items-center justify-center gap-1.5 text-xs font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>{t('accounts.new')}</span>
        </Link>
      </div>
    </div>
  );
}
