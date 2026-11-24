import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency, maskCurrency } from '../../utils/currency.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

interface AmountVisibilityState {
  hidden: boolean;
  toggle: () => void;
}

const AmountVisibilityContext = createContext<AmountVisibilityState | null>(null);

/**
 * App-wide "hide amounts" state. Amounts start hidden each time the app opens
 * (privacy when the screen is visible to others) and the choice is shared by all pages.
 */
export function AmountVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(true);
  const toggle = useCallback(() => setHidden((v) => !v), []);
  const value = useMemo(() => ({ hidden, toggle }), [hidden, toggle]);
  return (
    <AmountVisibilityContext.Provider value={value}>{children}</AmountVisibilityContext.Provider>
  );
}

export function useAmountVisibility(currency: string) {
  const ctx = useContext(AmountVisibilityContext);
  const [localHidden, setLocalHidden] = useState(true);
  const hidden = ctx ? ctx.hidden : localHidden;
  const toggle = useMemo(() => ctx?.toggle ?? (() => setLocalHidden((v) => !v)), [ctx]);
  const money = useCallback(
    (amount: number) => (hidden ? maskCurrency(currency) : formatCurrency(amount, currency)),
    [hidden, currency]
  );
  return { hidden, toggle, money };
}

/** Global eye toggle shown in the app header / sidebar. */
export function AmountVisibilityToggle({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  const ctx = useContext(AmountVisibilityContext);
  if (!ctx) return null;
  const { hidden, toggle } = ctx;
  const label = hidden ? t('dashboard.showAmounts') : t('dashboard.hideAmounts');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!hidden}
      title={label}
      aria-label={label}
      className={`p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors shrink-0 ${className}`}
    >
      {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );
}
