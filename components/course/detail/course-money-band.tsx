'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  DollarSign,
  Lock,
  ShoppingCart,
  TrendingUp,
  Wallet
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/components/course/courseUtils';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { StatTile } from './stat-tile';
import {
  RANGE_OPTIONS,
  buildRevenueSeries,
  paymentsInLastDays,
  sumAmount,
  type RangeOption
} from './revenue';
import type { CoursePayment } from './types';

type CourseMoneyBandProps = {
  payments: CoursePayment[];
  loading: boolean;
};

export function CourseMoneyBand({ payments, loading }: CourseMoneyBandProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [range, setRange] = useState<RangeOption>(RANGE_OPTIONS[1]);

  const periodPayments = useMemo(
    () => paymentsInLastDays(payments, range.days),
    [payments, range.days]
  );
  const grossAllTime = useMemo(() => sumAmount(payments), [payments]);
  const grossPeriod = useMemo(
    () => sumAmount(periodPayments),
    [periodPayments]
  );
  const series = useMemo(
    () => buildRevenueSeries(periodPayments, range.days, locale),
    [periodPayments, range.days, locale]
  );

  const rangeLabel = t(range.labelKey);
  const toman = t('common.toman');
  const avgSale =
    payments.length > 0 ? Math.round(grossAllTime / payments.length) : null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wallet className="h-4 w-4 text-emerald-600" />
            {t('courseDetail.financeTitle')}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 shrink-0" />
            {t('courseDetail.financeVisibility')}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <Calendar className="me-2 h-3.5 w-3.5" />
              {rangeLabel}
              <ChevronDown className="ms-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {RANGE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.days}
                onClick={() => setRange(option)}
                className={cn(
                  range.days === option.days && 'font-semibold text-primary'
                )}
              >
                {t(option.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={<DollarSign className="h-4 w-4" />}
            label={t('courseDetail.grossAllTime')}
            value={loading ? null : `${formatNumber(grossAllTime)} ${toman}`}
            sub={t('courseDetail.grossAllTimeHint')}
            color="emerald"
          />
          <StatTile
            icon={<TrendingUp className="h-4 w-4" />}
            label={t('courseDetail.revenuePeriod', { period: rangeLabel })}
            value={loading ? null : `${formatNumber(grossPeriod)} ${toman}`}
            sub={t('courseDetail.sales', {
              count: formatNumber(periodPayments.length)
            })}
            color="blue"
          />
          <StatTile
            icon={<ShoppingCart className="h-4 w-4" />}
            label={t('courseDetail.paidSales')}
            value={loading ? null : formatNumber(payments.length)}
            sub={t('courseDetail.paidSalesHint')}
            color="violet"
          />
          <StatTile
            icon={<BarChart3 className="h-4 w-4" />}
            label={t('courseDetail.avgSalePrice')}
            value={
              loading
                ? null
                : avgSale
                  ? `${formatNumber(avgSale)} ${toman}`
                  : '—'
            }
            sub={t('courseDetail.perPayment')}
            color="amber"
          />
        </div>

        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : grossPeriod === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <TrendingUp className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">{t('courseDetail.noRevenue')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={series}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="courseRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(1, Math.floor(series.length / 6))}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}K` : String(value)
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  `${formatNumber(value)} ${toman}`,
                  t('dashboard.revenue')
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--popover))',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#courseRevenue)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
