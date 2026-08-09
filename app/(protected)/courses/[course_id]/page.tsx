'use client';

import { useCallback, useEffect, useState } from 'react';
import { markdownToPlainText } from '@/lib/markdown';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Globe,
  EyeOff,
  Users,
  DollarSign,
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  ChevronDown,
  BarChart3,
  Layers,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import NoAcademyState from '@/components/course/NoAcademyState';

// ─── Date range helpers ────────────────────────────────────────────────────

type RangeOption = { labelKey: string; days: number };

const RANGE_OPTIONS: RangeOption[] = [
  { labelKey: 'courseDetail.last7', days: 7 },
  { labelKey: 'courseDetail.last30', days: 30 },
  { labelKey: 'courseDetail.last90', days: 90 },
  { labelKey: 'courseDetail.last6m', days: 180 },
  { labelKey: 'courseDetail.last12m', days: 365 }
];

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: toISODate(start), end: toISODate(end) };
}

function buildChartData(payments: any[], days: number) {
  const buckets: Record<string, number> = {};
  const { start } = dateRange(days);
  const startDate = new Date(start);
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    buckets[toISODate(d)] = 0;
  }
  for (const p of payments) {
    const raw = p.paid_at ?? p.payment_date ?? p.created_at;
    if (!raw) continue;
    const day = raw.slice(0, 10);
    if (buckets[day] !== undefined) buckets[day] += p.amount ?? 0;
  }
  return Object.entries(buckets).map(([date, revenue]) => ({
    date,
    revenue,
    label: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));
}

// ─── Stat card ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color = 'primary'
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    violet: 'bg-violet-500/10 text-violet-600',
    amber: 'bg-amber-500/10 text-amber-600'
  };
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              colorMap[color] ?? colorMap.primary
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold leading-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams<{ course_id: string }>();
  const courseId = params.course_id;
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();

  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<RangeOption>(
    RANGE_OPTIONS[1]
  );
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      apiClient
        .getCourse(courseId)
        .then((data) => setCourse(data))
        .catch(() => {})
        .finally(() => setCourseLoading(false));
    }
  }, [courseId]);

  const fetchRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const { start, end } = dateRange(selectedRange.days);
      const data = (await apiClient.getPayments({
        course_id: courseId,
        start_date: start,
        end_date: end,
        status: 'PAID',
        limit: 500
      })) as any;
      const raw = Array.isArray(data)
        ? data
        : (data?.payments ?? data?.data ?? []);
      setPayments(Array.isArray(raw) ? raw : []);
    } catch {
      setPayments([]);
    } finally {
      setRevenueLoading(false);
    }
  }, [courseId, selectedRange]);

  useEffect(() => {
    apiClient
      .getEnrollments({ course_id: courseId, limit: 10 })
      .then((data: any) => {
        const list = Array.isArray(data)
          ? data
          : (data?.enrollments ?? data?.data ?? []);
        setEnrollments(list);
      })
      .catch(() => {});
  }, [courseId]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (!selectedAcademy) return <NoAcademyState />;

  if (courseLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">{t('courseDetail.notFound')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/courses')}
          >
            {t('courseDetail.backToCourses')}
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalStudents = course.students_count ?? enrollments.length ?? 0;
  const totalLessons = course.lessons_count ?? 0;
  const chartData = buildChartData(payments, selectedRange.days);
  const pricingType =
    course.pricing_type ?? (course.primary_price === 0 ? 'FREE' : 'ONE_TIME');
  const rangeLabel = t(selectedRange.labelKey);

  const PRICING_COLORS: Record<string, string> = {
    FREE: 'bg-emerald-100 text-emerald-700',
    ONE_TIME: 'bg-blue-100 text-blue-700',
    PAYMENT_PLAN: 'bg-violet-100 text-violet-700',
    SUBSCRIPTION: 'bg-amber-100 text-amber-700'
  };

  const PRICING_LABELS: Record<string, string> = {
    FREE: t('wizard.free'),
    ONE_TIME: t('wizard.oneTime'),
    PAYMENT_PLAN: t('wizard.paymentPlan'),
    SUBSCRIPTION: t('wizard.subscriptionType')
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 shrink-0"
            onClick={() => router.push('/courses')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.title}
              </h1>
              <Badge
                className={cn(
                  'rounded-full text-xs font-semibold',
                  course.is_published
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-muted text-muted-foreground'
                )}
                variant="outline"
              >
                {course.is_published
                  ? t('courses.published')
                  : t('courses.draft')}
              </Badge>
              {PRICING_COLORS[pricingType] && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    PRICING_COLORS[pricingType]
                  )}
                >
                  {PRICING_LABELS[pricingType] ?? pricingType}
                </span>
              )}
              {course.is_featured && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <Star className="h-3 w-3" />
                  {t('courses.featured')}
                </span>
              )}
            </div>
            {course.description && (
              <p className="line-clamp-1 max-w-xl text-sm text-muted-foreground">
                {markdownToPlainText(course.description)}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${courseId}/edit`)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            {t('common.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${courseId}/seasons`)}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            {t('courseDetail.curriculum')}
          </Button>
          <Button
            size="sm"
            variant={course.is_published ? 'secondary' : 'default'}
          >
            {course.is_published ? (
              <>
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                {t('common.inactive')}
              </>
            ) : (
              <>
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                {t('common.activate')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label={t('courseDetail.revenuePeriod', { period: rangeLabel })}
          value={revenueLoading ? '…' : `${totalRevenue.toLocaleString()} T`}
          sub={t('courseDetail.sales', { count: payments.length })}
          color="emerald"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label={t('courseDetail.totalStudents')}
          value={totalStudents.toLocaleString()}
          sub={t('courseDetail.allTimeEnrollments')}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5" />}
          label={t('courseDetail.lessons')}
          value={totalLessons}
          sub={t('courseDetail.sections', { count: course.seasons_count ?? 0 })}
          color="violet"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label={t('courseDetail.avgSalePrice')}
          value={
            payments.length > 0
              ? `${Math.round(totalRevenue / payments.length).toLocaleString()} T`
              : '—'
          }
          sub={t('courseDetail.perPayment')}
          color="amber"
        />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-semibold">
              {t('courseDetail.revenueChart')}
            </CardTitle>
            <CardDescription>
              {totalRevenue > 0
                ? `${totalRevenue.toLocaleString()} Toman — ${rangeLabel}`
                : t('courseDetail.noRevenue')}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-3.5 w-3.5" />
                {rangeLabel}
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RANGE_OPTIONS.map((r) => (
                <DropdownMenuItem
                  key={r.days}
                  onClick={() => setSelectedRange(r)}
                  className={cn(
                    selectedRange.days === r.days &&
                      'font-semibold text-primary'
                  )}
                >
                  {t(r.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : totalRevenue === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center text-muted-foreground">
              <TrendingUp className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">{t('courseDetail.noRevenue')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
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
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                  }
                />
                <Tooltip
                  formatter={(v: number) => [
                    `${v.toLocaleString()} T`,
                    t('dashboard.revenue')
                  ]}
                  labelFormatter={(l) => l}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Two-column: recent students + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {t('courseDetail.recentEnrollments')}
            </CardTitle>
            <CardDescription>
              {t('courseDetail.recentEnrollmentsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Users className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">{t('courseDetail.noEnrollments')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('students.student')}</TableHead>
                    <TableHead>{t('students.enrolledAt')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.slice(0, 8).map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {(
                              e.user?.display_name ??
                              e.profile?.display_name ??
                              'U'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {e.user?.display_name ??
                              e.profile?.display_name ??
                              t('students.unknownStudent')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {e.enrolled_at
                          ? new Date(e.enrolled_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={e.status?.toLowerCase() ?? 'active'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('courseDetail.pricingCard')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('courses.pricing')}
                </span>
                <span className="font-medium">
                  {PRICING_LABELS[pricingType] ?? pricingType}
                </span>
              </div>
              {course.primary_price != null && course.primary_price > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('courses.price')}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {course.primary_price.toLocaleString()} Toman
                  </span>
                </div>
              )}
              {course.primary_price === 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('courses.price')}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {t('courses.free')}
                  </span>
                </div>
              )}
              <div className="flex justify-end pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/courses/${courseId}/plans`)}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  {t('courseDetail.paymentPlansLink')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t('courseDetail.manageCard')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                {
                  label: t('courseDetail.curriculum'),
                  icon: <Layers className="h-4 w-4" />,
                  href: `/courses/${courseId}/seasons`
                },
                {
                  label: t('courseDetail.editDetails'),
                  icon: <Edit className="h-4 w-4" />,
                  href: `/courses/${courseId}/edit`
                }
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
