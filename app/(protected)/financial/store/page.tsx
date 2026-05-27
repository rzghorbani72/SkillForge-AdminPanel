'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  CalendarDays,
  Download,
  MoreHorizontal,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useFinancialFilters } from '@/hooks/useFinancialFilters';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { FinancialFilterBar } from '@/components/financial/FinancialFilterBar';
import { FinancialCharts } from '@/components/financial/FinancialCharts';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type {
  AcademyFinancialOverview,
  AcademyPayment,
  PaymentStatus
} from '@/types/financial';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | PaymentStatus;

const STATUS_FILTERS: { value: StatusFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'financial.store.overview.allStatuses' },
  { value: 'PAID', labelKey: 'financial.store.overview.statusPaid' },
  { value: 'PENDING', labelKey: 'financial.store.overview.statusPending' },
  { value: 'FAILED', labelKey: 'financial.store.overview.statusFailed' },
  { value: 'REFUNDED', labelKey: 'financial.store.overview.statusRefunded' }
];

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variants: Record<PaymentStatus, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    PENDING:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    FAILED:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
    REFUNDED:
      'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
  };
  const labels: Record<PaymentStatus, string> = {
    PAID: 'پرداخت شده',
    PENDING: 'در انتظار',
    FAILED: 'ناموفق',
    REFUNDED: 'مسترد'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  delta?: number | null;
  accent?: boolean;
}

function StatCard({ label, value, sub, delta, accent }: StatCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-sm',
        accent && 'border-transparent bg-primary/5'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              accent ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
          {delta != null && delta !== 0 && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                delta >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {Math.abs(delta).toLocaleString()}٪
            </span>
          )}
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function StoreFinancialPage() {
  const { t } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const formatCurrency = useFormatCurrency();
  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    dateRange,
    years,
    formatDate
  } = useFinancialFilters();

  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [overview, setOverview] = useState<AcademyFinancialOverview | null>(
    null
  );
  const [payments, setPayments] = useState<AcademyPayment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');

  const loadData = useCallback(async () => {
    if (!currentAcademy?.id) return;
    setLoading(true);
    try {
      const [overviewData, revenueData] = await Promise.all([
        apiClient.getAcademyFinancialOverview(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        ),
        apiClient.getAcademyRevenueFromPayments(
          currentAcademy.id,
          dateRange.startIso,
          dateRange.endIso
        )
      ]);
      setOverview(overviewData as AcademyFinancialOverview);
      setPayments((revenueData?.payments ?? []) as AcademyPayment[]);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [currentAcademy?.id, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentAcademy) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('financial.store.overview.noStore')}
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message={t('financial.store.overview.loading')} />;
  }

  const gateways = Array.from(
    new Set(payments.map((p) => p.method).filter(Boolean))
  ) as string[];

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (gatewayFilter !== 'all' && p.method !== gatewayFilter) return false;
    return true;
  });

  const paidCount = payments.filter((p) => p.status === 'PAID').length;

  const margin = Number(overview?.profit?.margin ?? 0);

  const statCards: StatCardProps[] = [
    {
      label: t('financial.store.overview.totalRevenue'),
      value: formatCurrency(
        overview?.revenue?.total ?? 0,
        overview?.revenue?.currency
      ),
      sub: t('financial.store.overview.fromPayments', {
        count: overview?.revenue?.from_payments ?? 0
      }),
      delta: null
    },
    {
      label: t('financial.store.overview.netProfit'),
      value: formatCurrency(
        overview?.profit?.total ?? 0,
        overview?.revenue?.currency
      ),
      sub: t('financial.store.overview.profitMargin', {
        margin: margin.toFixed(1)
      }),
      delta: margin || null,
      accent: true
    },
    {
      label: t('financial.store.overview.successfulPayments'),
      value: paidCount.toLocaleString(),
      sub: t('financial.store.overview.paymentCount', {
        count: payments.length
      }),
      delta: null
    },
    {
      label: t('financial.store.overview.enrollments'),
      value: (overview?.statistics?.enrollments ?? 0).toLocaleString(),
      sub: t('financial.store.overview.courses', {
        count: overview?.statistics?.courses ?? 0
      }),
      delta: null
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('financial.store.overview.eyebrow')}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {t('financial.store.overview.paymentsTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('financial.store.overview.paymentsDescription2')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <CalendarDays className="h-4 w-4" />
            {t('financial.store.overview.dateRange')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            {t('financial.store.overview.export')}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <FinancialFilterBar
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              years={years}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts */}
      <FinancialCharts payments={payments} selectedMonth={selectedMonth} />

      {/* Payments Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
            {STATUS_FILTERS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  statusFilter === tab.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Gateway Filter */}
          <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('financial.store.overview.allGateways')}
              </SelectItem>
              {gateways.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-28">
                  {t('financial.store.overview.id')}
                </TableHead>
                <TableHead>{t('financial.store.overview.user')}</TableHead>
                <TableHead>{t('financial.store.overview.course')}</TableHead>
                <TableHead className="text-end">
                  {t('financial.store.overview.amount')}
                </TableHead>
                <TableHead>{t('financial.store.overview.gateway')}</TableHead>
                <TableHead>{t('financial.store.overview.date')}</TableHead>
                <TableHead>{t('financial.store.overview.student')}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {t('financial.store.overview.noPayments')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      TXN-{p.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {p.profile?.display_name ?? '—'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {p.course?.title ?? '—'}
                    </TableCell>
                    <TableCell className="text-end font-semibold tabular-nums">
                      {formatCurrency(p.amount, p.currency)}
                    </TableCell>
                    <TableCell>
                      {p.method ? (
                        <Badge variant="outline" className="text-xs">
                          {p.method}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(p.created_at)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {t('common.viewDetails')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
