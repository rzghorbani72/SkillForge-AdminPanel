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
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { AcademyOnboarding } from '@/components/dashboard/onboarding/academy-onboarding';
import { BuyPlansSection } from '@/components/dashboard/buy-plans-section';
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
  const { academies, selectedAcademy, isLoading: storeLoading } = useStore();
  const [period, setPeriod] = useState<Period>('30d');

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

  const canManagePlan = canManageSubscription(user);
  const { needsPlanPurchase, isLoading: subscriptionLoading } =
    useAcademySubscription(canManagePlan);
  const showBuyPlans =
    canManagePlan &&
    !subscriptionLoading &&
    needsPlanPurchase &&
    academies.length > 0;

  const firstName =
    (user as any)?.profile?.display_name?.split(' ')?.[0] ??
    (user as any)?.profile?.name?.split(' ')?.[0] ??
    '';

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
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

  // Nothing on this dashboard can be computed without an academy, so the
  // onboarding surface replaces the metric grid rather than sitting above
  // rows of zeros.
  if (!storeLoading && !isPlatformAdmin && academies.length === 0) {
    return (
      <div className="dashboard-shell flex-1">
        <div className="relative space-y-5 p-4 sm:p-6">
          <AcademyOnboarding />
          {canManagePlan && <BuyPlansSection />}
        </div>
      </div>
    );
  }

  if (showBuyPlans) {
    return (
      <div className="dashboard-shell flex-1">
        <div className="relative space-y-5 p-4 sm:p-6">
          <BuyPlansSection />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell flex-1">
      <div className="relative space-y-5 p-4 sm:p-6">
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

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex max-w-full overflow-x-auto rounded-lg border bg-white/70 p-0.5 backdrop-blur-md">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
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
              className="flex items-center gap-1.5 rounded-lg border bg-white/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-white/90"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isFa ? 'خروجی گزارش' : 'Export'}
              </span>
            </button>
          </div>
        </div>

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
    </div>
  );
}
