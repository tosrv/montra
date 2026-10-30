import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../i18n/LanguageProvider.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import { CategoryIcon } from '../ui/CategoryIcon.tsx';
import { ChartCard, ChartTooltipContent, tableClass } from './ChartCard.tsx';

/** Only four hues pass colorblind separation for every slice pair; the rest fold into "Other". */
const SLOT_COLORS = [
  'var(--chart-cat-1)',
  'var(--chart-cat-2)',
  'var(--chart-cat-3)',
  'var(--chart-cat-4)',
];
const OTHER_COLOR = 'var(--chart-cat-other)';
const OTHER_ID = 'other';

export interface ExpenseBreakdownItem {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

interface ExpenseDonutChartProps {
  items: ExpenseBreakdownItem[]; // sorted by amount, descending
  total: number;
  currency: string;
  description: string;
}

export function ExpenseDonutChart({ items, total, currency, description }: ExpenseDonutChartProps) {
  const { t } = useLanguage();

  const top = items.slice(0, SLOT_COLORS.length);
  const rest = items.slice(SLOT_COLORS.length);
  const colorFor = (index: number) =>
    index < SLOT_COLORS.length ? SLOT_COLORS[index] : OTHER_COLOR;

  const slices = [
    ...top.map((item, i) => ({
      id: String(item.categoryId),
      name: item.categoryName,
      amount: item.amount,
      percentage: item.percentage,
      color: SLOT_COLORS[i],
    })),
    ...(rest.length > 0
      ? [
          {
            id: OTHER_ID,
            name: t('dashboard.other'),
            amount: rest.reduce((sum, item) => sum + item.amount, 0),
            percentage: rest.reduce((sum, item) => sum + item.percentage, 0),
            color: OTHER_COLOR,
          },
        ]
      : []),
  ];

  return (
    <ChartCard
      title={t('dashboard.breakdown')}
      description={description}
      bodyClassName="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center"
      chart={
        items.length === 0 ? (
          <div className="md:col-span-2 py-8 text-center text-neutral-400 dark:text-neutral-500 text-xs">
            {t('dashboard.noData')}
          </div>
        ) : (
          <>
            <div className="relative h-52 w-full max-w-[220px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="95%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="var(--chart-surface)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.id} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const slice = payload[0].payload as (typeof slices)[number];
                      return (
                        <ChartTooltipContent
                          label={slice.name}
                          rows={[
                            {
                              color: slice.color,
                              label: `${slice.percentage}%`,
                              value: formatCurrency(slice.amount, currency),
                            },
                          ]}
                        />
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t('chart.total')}
                </span>
                <span className="text-sm font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>

            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li key={item.categoryId} className="flex items-center gap-2.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                    style={{ backgroundColor: colorFor(i) }}
                  />
                  <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                    <CategoryIcon name={item.categoryIcon} className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {item.categoryName}
                  </span>
                  <span className="ml-auto font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <span className="w-9 text-right tabular-nums text-neutral-400 dark:text-neutral-500">
                    {item.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )
      }
      table={
        <table className={tableClass.table}>
          <thead>
            <tr>
              <th className={tableClass.th}>{t('chart.category')}</th>
              <th className={tableClass.thNum}>{t('dashboard.expense')}</th>
              <th className={tableClass.thNum}>{t('chart.share')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.categoryId}>
                <td className={tableClass.td}>{item.categoryName}</td>
                <td className={tableClass.tdNum}>{formatCurrency(item.amount, currency)}</td>
                <td className={tableClass.tdNum}>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    />
  );
}
