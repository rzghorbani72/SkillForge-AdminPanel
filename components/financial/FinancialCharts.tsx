'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AcademyPayment } from '@/types/financial';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';

interface Props {
  payments: AcademyPayment[];
  selectedMonth: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  PAID: '#10b981',
  PENDING: '#f59e0b',
  FAILED: '#ef4444',
  REFUNDED: '#94a3b8'
};

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
};

function shortNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function FinancialCharts({ payments, selectedMonth }: Props) {
  const formatCurrency = useFormatCurrency();

  const timeSeriesData = useMemo(() => {
    const map = new Map<
      string,
      { label: string; gross: number; paid: number }
    >();

    for (const p of payments) {
      const date = new Date(p.created_at);
      const key = selectedMonth
        ? String(date.getDate()).padStart(2, '0')
        : String(date.getMonth() + 1).padStart(2, '0');
      const label = selectedMonth
        ? `${date.getDate()}`
        : date.toLocaleString('en', { month: 'short' });

      const existing = map.get(key) ?? { label, gross: 0, paid: 0 };
      existing.gross += p.amount;
      if (p.status === 'PAID') existing.paid += p.amount;
      map.set(key, existing);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [payments, selectedMonth]);

  const statusData = useMemo(
    () =>
      Object.entries(
        payments.reduce<Record<string, number>>((acc, p) => {
          acc[p.status] = (acc[p.status] ?? 0) + 1;
          return acc;
        }, {})
      )
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({
          name,
          label: STATUS_LABELS[name] ?? name,
          value
        })),
    [payments]
  );

  if (payments.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Revenue Over Time */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Revenue Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={timeSeriesData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                stroke="transparent"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="transparent"
                tickLine={false}
                tickFormatter={shortNumber}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'gross' ? 'Total Gross' : 'Successful'
                ]}
              />
              <Area
                type="monotone"
                dataKey="gross"
                stroke="#6366f1"
                fill="url(#grossGrad)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="paid"
                stroke="#10b981"
                fill="url(#paidGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Total Gross
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Successful
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="label"
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
