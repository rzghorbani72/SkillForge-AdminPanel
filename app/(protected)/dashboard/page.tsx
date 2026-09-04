'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Download } from 'lucide-react';
import useDashboard from '@/components/dashboard/useDashboard';
import DashboardHero from '@/components/dashboard/dashboard-hero';
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
import { SetupChecklistBanner } from '@/components/dashboard/onboarding/setup-checklist-banner';
import { BuyPlansSection } from '@/components/dashboard/buy-plans-section';

type Period = '7d' | '30d' | '3m' | '1y';

const PERIODS: { key: Period; fa: string; en: string }[] = [
  { key: '7d', fa: '۷ روز', en: '7 days' },
  { key: '30d', fa: '۳۰ روز', en: '30 days' },
  { key: '3m', fa: '۳ ماه', en: '3 months' },
  { key: '1y', fa: 'امسال', en: 'This year' }
];

/** Ambient background wash: the three blurred colour fields behind the grid. */
function DashboardGlow() {
  return (
    <>
      <div className="dashboard-glow dashboard-glow-1" />
      <div className="dashboard-glow dashboard-glow-2" />
      <div className="dashboard-glow dashboard-glow-3" />
    </>
  );
}

/** Layout-shaped placeholder: the grid appears before the data does. */
function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div className="dashboard-shell flex-1">
      <DashboardGlow />
      <div className="relative space-y-6 p-4 sm:p-6" aria-label={label}>
        <div className="space-y-2">
          <div className="shimmer h-4 w-24 rounded-full" />
          <div className="shimmer h-8 w-56 rounded-lg" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="stat-card h-[190px]">
                <div className="shimmer h-10 w-10 rounded-2xl" />
                <div className="shimmer mt-4 h-3 w-20 rounded-full" />
                <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="hero-media order-first min-h-[220px] lg:order-none" />
          <div className="flex flex-col gap-4">
            {[2, 3].map((i) => (
              <div key={i} className="stat-card h-[190px]">
                <div className="shimmer h-10 w-10 rounded-2xl" />
                <div className="shimmer mt-4 h-3 w-20 rounded-full" />
                <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="dashboard-card shimmer h-[360px]" />
          <div className="dashboard-card shimmer h-[360px]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="dashboard-card shimmer h-[300px]" />
          <div className="dashboard-card shimmer h-[300px]" />
        </div>
      </div>
    </div>
  );
}

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
    monthlyChartData,
    weekdayData,
    statusData,
    overallCompletion,
    journeyData
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
    return <DashboardSkeleton label={t('dashboard.loadingDashboardData')} />;
  }

  const activePeriod = PERIODS.find((p) => p.key === period)!;

  // Nothing on this dashboard can be computed without an academy, so the
  // onboarding surface replaces the metric grid rather than sitting above
  // rows of zeros. Plans are deliberately absent: the first step is creating an
  // academy, and a price list here would sell a plan with nothing to attach to.
  if (!storeLoading && !isPlatformAdmin && academies.length === 0) {
    return (
      <div className="dashboard-shell flex-1">
        <DashboardGlow />
        <div className="relative space-y-5 p-4 sm:p-6">
          <AcademyOnboarding />
        </div>
      </div>
    );
  }

  if (showBuyPlans) {
    return (
      <div className="dashboard-shell flex-1">
        <DashboardGlow />
        <div className="relative space-y-5 p-4 sm:p-6">
          <SetupChecklistBanner hasCourse={recentCourses.length > 0} />
          <BuyPlansSection />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell flex-1">
      <DashboardGlow />
      <div className="relative space-y-6 p-4 sm:p-6">
        <SetupChecklistBanner hasCourse={recentCourses.length > 0} />
        {/* Page header */}
        <div className="fade-in-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {isFa ? 'داده‌های زنده' : 'Live data'}
            </span>
            <h1 className="mt-2 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-[26px] font-bold leading-tight text-transparent sm:text-3xl">
              {isFa
                ? `خوش آمدید${firstName ? `، ${firstName}` : ''}`
                : `Welcome back${firstName ? `, ${firstName}` : ''}`}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isFa
                ? `یک نگاه سریع به وضعیت آکادمی‌هایتان در ${activePeriod.fa} گذشته`
                : `A quick look at your academies over the last ${activePeriod.en}`}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="dash-segment">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  data-active={period === p.key}
                  className="dash-segment-item"
                >
                  {isFa ? p.fa : p.en}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md transition-colors hover:bg-white hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isFa ? 'خروجی گزارش' : 'Export'}
              </span>
            </button>
          </div>
        </div>

        <div className="stagger-children space-y-6">
          {/* Row 1: two stacked cards | academy panel | two stacked cards */}
          <DashboardHero cards={statsCards} />

          {/* Row 2: Revenue area chart (2/3) + student journey (1/3) */}
          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <RevenueEnrollmentChart data={monthlyChartData} />
            <ConversionFunnel steps={journeyData} />
          </div>

          {/* Row 3: Weekday bar chart (1/2) + Completion donut (1/2) */}
          <div className="grid gap-5 lg:grid-cols-2">
            <WeekdayEnrollmentChart data={weekdayData} />
            <CompletionDonut
              segments={statusData}
              completion={overallCompletion}
            />
          </div>

          {/* Row 4: Top courses table (1.4/2) + Activity history (1/2) */}
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <TopCoursesTable courses={recentCourses} />
            <RecentActivityFeed activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
