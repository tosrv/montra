import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthNames } from '../../utils/dates.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-11
  onChange: (year: number, month: number) => void;
}

const arrowClass =
  'p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors';

/**
 * Compact "‹ Nov 2026 ›" navigator. The label is backed by an invisible native
 * select (months of the surrounding years) so tapping it opens the OS picker.
 */
export function MonthNavigator({ year, month, onChange }: MonthNavigatorProps) {
  const { t } = useLanguage();
  const monthNames = getMonthNames();

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  const options: { year: number; month: number }[] = [];
  for (let y = year - 2; y <= year + 1; y++) {
    for (let m = 0; m < 12; m++) options.push({ year: y, month: m });
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => shift(-1)}
        className={arrowClass}
        title={t('common.prevMonth')}
        aria-label={t('common.prevMonth')}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="relative">
        <span className="block px-1.5 py-1 rounded-md text-sm font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap min-w-22 text-center">
          {monthNames[month]?.slice(0, 3)} {year}
        </span>
        <select
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number);
            onChange(y, m);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={t('chart.month')}
        >
          {options.map((o) => (
            <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
              {monthNames[o.month]} {o.year}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => shift(1)}
        className={arrowClass}
        title={t('common.nextMonth')}
        aria-label={t('common.nextMonth')}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
