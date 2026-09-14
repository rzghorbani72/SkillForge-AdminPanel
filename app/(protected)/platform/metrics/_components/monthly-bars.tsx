'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePeriodLabel } from './period-label';

interface MonthlyBarsProps {
  data: ReadonlyArray<object>;
  xKey?: string;
  dataKey: string;
  name: string;
}

export function MonthlyBars({ data, xKey = 'month', dataKey, name }: MonthlyBarsProps) {
  const periodLabel = usePeriodLabel();
  const formatNumber = useNumberFormat();

  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full overflow-x-auto p-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={480}>
        <BarChart data={[...data]}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={xKey} tick={{ fontSize: 14 }} tickFormatter={periodLabel} />
          <YAxis
            tick={{ fontSize: 14 }}
            width={96}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            labelFormatter={(label: string) => periodLabel(label)}
            formatter={(value: number) => formatNumber(value)}
          />
          <Bar dataKey={dataKey} name={name} fill="hsl(var(--primary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
