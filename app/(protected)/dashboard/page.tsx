'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Sparkles, Download } from 'lucide-react';
import useDashboard from '@/components/dashboard/useDashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import RevenueEnrollmentChart from '@/components/dashboard/RevenueEnrollmentChart';
import TopCoursesTable from '@/components/dashboard/TopCoursesTable';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import ConversionFunnel from '@/components/dashboard/ConversionFunnel';
import WeekdayEnrollmentChart from '@/components/dashboard/WeekdayEnrollmentChart';
import CompletionDonut from '@/components/dashboard/CompletionDonut';
import { useTranslation } from '@/lib/i18n/hooks';
import { useInitializeStores } from '@/hooks/useInitializeStores';
import CampaignBanner from '@/components/dashboard/CampaignBanner';
import { SubscriptionStatusCard } from '@/components/dashboard/subscription-status-card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '3m' | '1y';

const PERIODS: { key: Period; fa: string; en: string }[] = [
  { key: '7d', fa: '۷ روز', en: '7 days' },
  { key: '30d', fa: '۳۰ روز', en: '30 days' },
  { key: '3m', fa: '۳ ماه', en: '3 months' },
  { key: '1y', fa: 'امسال', en: 'This year' }
];

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';
  const { user } = useAuthUser();
  const router = useRouter();
  const { selectedAcademy, isLoading: storeLoading } = useStore();
  const [period, setPeriod] = useState<Period>('30d');

  useInitializeStores();

  // Platform admins with no academy selected belong in Platform mode; the
  // academy dashboard has no tenant context to render.
  const isPlatformAdmin = user?.isAdminProfile || user?.platformLevel || false;
  useEffect(() => {
    if (!storeLoading && isPlatformAdmin && !selectedAcademy) {
      router.replace('/platform');
    }
  }, [storeLoading, isPlatformAdmin, selectedAcademy, router]);

  const {
    isLoading,
    recentCourses,
    recentActivity,
    statsCards,
    monthlyChartData
  } = useDashboard();

  const firstName =
    (user as any)?.profile?.display_name?.split(' ')?.[0] ??
    (user as any)?.profile?.name?.split(' ')?.[0] ??
    '';

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="relative mx-auto h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Sparkles className="h-7 w-7 animate-pulse text-white" />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t('dashboard.loadingDashboardData')}
          </p>
        </div>
      </div>
    );
  }

  const activePeriod = PERIODS.find((p) => p.key === period)!;

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {isFa ? 'مرور کلی' : 'Overview'}
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {isFa
              ? `خوش آمدید${firstName ? `، ${firstName}` : ''} 👋`
              : `Welcome back${firstName ? `, ${firstName}` : ''} 👋`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFa
              ? `یک نگاه سریع به وضعیت آکادمی‌هایتان در ${activePeriod.fa} گذشته`
              : `A quick look at your academies over the last ${activePeriod.en}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  period === p.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isFa ? p.fa : p.en}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            {isFa ? 'خروجی گزارش' : 'Export'}
          </button>
        </div>
      </div>

      {/* Subscription upgrade — Platform scope */}
      <SubscriptionStatusCard />

      {/* Campaign banner */}
      <CampaignBanner />

      {/* Row 1: 4 KPI cards */}
      <StatsCards cards={statsCards} />

      {/* Row 2: Revenue area chart (2/3) + Conversion funnel (1/3) */}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <RevenueEnrollmentChart data={monthlyChartData} />
        <ConversionFunnel />
      </div>

      {/* Row 3: Weekday bar chart (1/2) + Completion donut (1/2) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <WeekdayEnrollmentChart />
        <CompletionDonut />
      </div>

      {/* Row 4: Top courses table (1.4/2) + Activity history (1/2) */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <TopCoursesTable courses={recentCourses} />
        <RecentActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
