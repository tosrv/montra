import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';

interface ChartCardProps {
  title: string;
  description: string;
  legend?: React.ReactNode;
  chart: React.ReactNode;
  table: React.ReactNode;
  /** Overrides the fixed-height chart box, e.g. for side-by-side layouts. */
  bodyClassName?: string;
}

/** shadcn-style chart card with a chart/table toggle (the table is the accessible view). */
export function ChartCard({
  title,
  description,
  legend,
  chart,
  table,
  bodyClassName = 'h-56 w-full',
}: ChartCardProps) {
  const { t } = useLanguage();
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
        >
          {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
          <span>{showTable ? t('chart.showChart') : t('chart.showTable')}</span>
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-auto">{table}</div>
      ) : (
        <>
          {legend}
          <div className={bodyClassName}>{chart}</div>
        </>
      )}
    </div>
  );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
      <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

interface TooltipRow {
  color: string;
  label: string;
  value: string;
}

/** shadcn-style tooltip body: small card, label on top, dot + name + right-aligned value. */
export function ChartTooltipContent({ label, rows }: { label: string; rows: TooltipRow[] }) {
  return (
    <div className="min-w-36 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{label}</div>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
              style={{ backgroundColor: row.color }}
            />
            <span className="text-neutral-500 dark:text-neutral-400">{row.label}</span>
            <span className="ml-auto pl-3 font-mono font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const tableClass = {
  table: 'w-full text-xs',
  th: 'text-left font-medium text-neutral-500 dark:text-neutral-400 py-2 border-b border-neutral-200 dark:border-neutral-800',
  thNum:
    'text-right font-medium text-neutral-500 dark:text-neutral-400 py-2 border-b border-neutral-200 dark:border-neutral-800',
  td: 'py-2 text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800/60',
  tdNum:
    'py-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800/60',
};

/** Compact axis ticks, e.g. 1.5 jt / 1.5M. */
export function formatCompact(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
