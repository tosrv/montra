import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthNames } from '../../utils/dates.ts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-11
  onChange: (year: number, month: number) => void;
}

const selectClass =
  'text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-transparent py-1 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:outline-none cursor-pointer';
const arrowClass =
  'p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors';

/** Prev/next arrows plus month & year selects, shared by month-scoped pages. */
export function MonthNavigator({ year, month, onChange }: MonthNavigatorProps) {
  const { t } = useLanguage();
  const monthNames = getMonthNames();
  const years = [year - 2, year - 1, year, year + 1, year + 2];

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs self-start sm:self-auto">
      <button
        type="button"
        onClick={() => shift(-1)}
        className={arrowClass}
        title={t('common.prevMonth')}
        aria-label={t('common.prevMonth')}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 px-1">
        <select
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
          className={selectClass}
          aria-label={t('chart.month')}
        >
          {monthNames.map((name, idx) => (
            <option key={name} value={idx}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => onChange(Number(e.target.value), month)}
          className={selectClass}
          aria-label={t('common.year')}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
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
