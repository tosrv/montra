import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import { formatDisplayDate, formatMonthYear } from '../../utils/dates.ts';
import type { BalancePoint } from '../../services/transactionService.ts';
import { ChartCard, ChartTooltipContent, formatCompact, tableClass } from './ChartCard.tsx';

const LINE = 'var(--chart-line)';

interface BalanceTrendChartProps {
  data: BalancePoint[];
  currency: string;
  year: number;
  month: number;
}

export function BalanceTrendChart({ data, currency, year, month }: BalanceTrendChartProps) {
  const { t, locale } = useLanguage();
  const rows = data.map((p) => ({ ...p, day: Number(p.date.slice(8)) }));

  return (
    <ChartCard
      title={t('dashboard.balanceTitle')}
      description={t('dashboard.balanceDesc', { month: formatMonthYear(year, month) })}
      chart={
        rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500">
            {t('dashboard.noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={LINE} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={LINE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
                tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                domain={['auto', 'auto']}
                tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
                tickFormatter={(v: number) => formatCompact(v, locale)}
              />
              <Tooltip
                cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as (typeof rows)[number];
                  return (
                    <ChartTooltipContent
                      label={formatDisplayDate(point.date)}
                      rows={[
                        {
                          color: LINE,
                          label: t('dashboard.balanceTitle'),
                          value: formatCurrency(point.balance, currency),
                        },
                      ]}
                    />
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={LINE}
                strokeWidth={2}
                fill="url(#balanceFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-surface, white)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      }
      table={
        <table className={tableClass.table}>
          <thead>
            <tr>
              <th className={tableClass.th}>{t('chart.date')}</th>
              <th className={tableClass.thNum}>{t('dashboard.balanceTitle')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.date}>
                <td className={tableClass.td}>{formatDisplayDate(p.date)}</td>
                <td className={tableClass.tdNum}>{formatCurrency(p.balance, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}
