import React, { useCallback, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency, maskCurrency } from '../../utils/currency.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

/**
 * Per-page "hide amounts" state. Amounts start hidden every time the page mounts
 * (privacy when the screen is visible to others).
 */
export function useAmountVisibility(currency: string) {
  const [hidden, setHidden] = useState(true);
  const toggle = useCallback(() => setHidden((v) => !v), []);
  const money = useCallback(
    (amount: number) => (hidden ? maskCurrency(currency) : formatCurrency(amount, currency)),
    [hidden, currency]
  );
  return { hidden, toggle, money };
}

export function AmountVisibilityToggle({
  hidden,
  onToggle,
}: {
  hidden: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const label = hidden ? t('dashboard.showAmounts') : t('dashboard.hideAmounts');

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!hidden}
      title={label}
      aria-label={label}
      className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl shadow-2xs transition-colors shrink-0"
    >
      {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}
