import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import { formatMonthYear, getMonthNames } from '../../utils/dates.ts';
import type { CashflowPoint } from '../../services/transactionService.ts';
import {
  ChartCard,
  ChartTooltipContent,
  LegendItem,
  formatCompact,
  tableClass,
} from './ChartCard.tsx';

const INCOME = 'var(--chart-income)';
const EXPENSE = 'var(--chart-expense)';

interface CashflowTrendChartProps {
  data: CashflowPoint[];
  currency: string;
}

export function CashflowTrendChart({ data, currency }: CashflowTrendChartProps) {
  const { t, locale } = useLanguage();
  const monthNames = getMonthNames();
  const rows = data.map((p) => ({
    ...p,
    label: monthNames[p.month].slice(0, 3),
    fullLabel: formatMonthYear(p.year, p.month),
  }));

  return (
    <ChartCard
      title={t('dashboard.cashflowTitle')}
      description={t('dashboard.cashflowDesc')}
      legend={
        <div className="flex items-center gap-4">
          <LegendItem color={INCOME} label={t('dashboard.income')} />
          <LegendItem color={EXPENSE} label={t('dashboard.expense')} />
        </div>
      }
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} barGap={2} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              tickFormatter={(v: number) => formatCompact(v, locale)}
            />
            <Tooltip
              cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as (typeof rows)[number];
                return (
                  <ChartTooltipContent
                    label={point.fullLabel}
                    rows={[
                      {
                        color: INCOME,
                        label: t('dashboard.income'),
                        value: formatCurrency(point.income, currency),
                      },
                      {
                        color: EXPENSE,
                        label: t('dashboard.expense'),
                        value: formatCurrency(point.expense, currency),
                      },
                      {
                        color: 'transparent',
                        label: t('dashboard.net'),
                        value: formatCurrency(point.income - point.expense, currency),
                      },
                    ]}
                  />
                );
              }}
            />
            <Bar
              dataKey="income"
              name={t('dashboard.income')}
              fill={INCOME}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name={t('dashboard.expense')}
              fill={EXPENSE}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      table={
        <table className={tableClass.table}>
          <thead>
            <tr>
              <th className={tableClass.th}>{t('chart.month')}</th>
              <th className={tableClass.thNum}>{t('dashboard.income')}</th>
              <th className={tableClass.thNum}>{t('dashboard.expense')}</th>
              <th className={tableClass.thNum}>{t('dashboard.net')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.fullLabel}>
                <td className={tableClass.td}>{p.fullLabel}</td>
                <td className={tableClass.tdNum}>{formatCurrency(p.income, currency)}</td>
                <td className={tableClass.tdNum}>{formatCurrency(p.expense, currency)}</td>
                <td className={tableClass.tdNum}>
                  {formatCurrency(p.income - p.expense, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}
