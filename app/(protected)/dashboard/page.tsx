'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import useDashboard from '@/components/dashboard/useDashboard';
import DashboardHero from '@/components/dashboard/dashboard-hero';
import ConversionFunnel from '@/components/dashboard/ConversionFunnel';
import CompletionDonut from '@/components/dashboard/CompletionDonut';
import MoneyCards from '@/components/dashboard/money-cards';
import MoneyFlowChart from '@/components/dashboard/money-flow-chart';
import PlanLimitsPanel from '@/components/dashboard/plan-limits-panel';
import CourseMoneyTable from '@/components/dashboard/course-money-table';
import TeacherMoneyTable from '@/components/dashboard/teacher-money-table';
import { useManagerMoney } from '@/components/dashboard/use-manager-money';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { canManageSubscription } from '@/lib/subscription-access';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { AcademyOnboarding } from '@/components/dashboard/onboarding/academy-onboarding';
import { SetupChecklistBanner } from '@/components/dashboard/onboarding/setup-checklist-banner';
import { BuyPlansSection } from '@/components/dashboard/buy-plans-section';
import {
  PERIOD_OPTIONS,
  type DashboardPeriod
} from '@/components/dashboard/dashboard-periods';
import {
  DashboardGlow,
  DashboardSkeleton
} from '@/components/dashboard/dashboard-shell';

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';
  const { user } = useAuthUser();
  const router = useRouter();
  const {
    academies,
    selectedAcademy,
    isLoading: storeLoading,
    error: storeError,
    refreshAcademies
  } = useStore();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const periodLabel = t(
    PERIOD_OPTIONS.find((option) => option.key === period)?.labelKey ??
      PERIOD_OPTIONS[1].labelKey
  );

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
    statsCards,
    statusData,
    overallCompletion,
    journeyData
  } = useDashboard(period, periodLabel);

  // Money, course and teacher figures are aggregated by the API so they stay
  // correct past the page caps the list endpoints impose.
  const money = useManagerMoney(period);

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

  const loadingLabel = t('dashboard.loadingDashboardData');
  const storeUnresolved =
    storeLoading && !selectedAcademy && academies.length === 0;

  if (storeUnresolved || (canManagePlan && subscriptionLoading)) {
    return <DashboardSkeleton label={loadingLabel} />;
  }

  // Nothing on this dashboard can be computed without an academy, so the
  // onboarding surface replaces the metric grid rather than sitting above
  // rows of zeros. Plans are deliberately absent: the first step is creating an
  // academy, and a price list here would sell a plan with nothing to attach to.
  // A failed academies fetch leaves the list empty, which is not the same as
  // owning none. Offering "create your first academy" there looks like the
  // platform lost the manager's academies, so a retry is shown instead.
  if (
    !storeLoading &&
    !isPlatformAdmin &&
    academies.length === 0 &&
    storeError
  ) {
    return (
      <div className="dashboard-shell flex-1">
        <DashboardGlow />
        <div className="relative space-y-3 p-4 sm:p-6">
          <h1 className="text-lg font-semibold">
            {t('common.somethingWentWrong')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.errorLoadingPage')}
          </p>
          <Button onClick={() => void refreshAcademies()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

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
          {!isLoading && (
            <SetupChecklistBanner hasCourse={recentCourses.length > 0} />
          )}
          <BuyPlansSection />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell flex-1">
      <DashboardGlow />
      <div className="relative space-y-6 p-4 sm:p-6">
        {!isLoading && (
          <SetupChecklistBanner hasCourse={recentCourses.length > 0} />
        )}
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
              {t('dashboard.periodSummary', { period: periodLabel })}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="dash-segment">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPeriod(option.key)}
                  data-active={period === option.key}
                  className="dash-segment-item"
                >
                  {t(option.labelKey)}
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
          {/* Row 1: the four money numbers a manager acts on */}
          <MoneyCards
            money={money.money}
            payouts_due={money.payouts_due}
            isLoading={money.isLoading}
          />

          {/* Row 2: academy panel + stock counters */}
          <DashboardHero
            cards={statsCards}
            period={period}
            isLoading={isLoading}
            loadingLabel={loadingLabel}
          />

          {/* Row 3: where the money goes (2/3) + student journey (1/3) */}
          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <MoneyFlowChart
              series={money.series}
              grain={money.period.grain}
              period={period}
              isLoading={money.isLoading}
            />
            <ConversionFunnel
              steps={journeyData}
              period={period}
              isLoading={isLoading}
            />
          </div>

          {/* Row 4: what the plan still allows before an upgrade is needed */}
          <PlanLimitsPanel limits={money.limits} isLoading={money.isLoading} />

          {/* Row 5: which course makes the money */}
          <CourseMoneyTable rows={money.courses} isLoading={money.isLoading} />

          {/* Row 5: which teacher makes the money (1.4/2) + progress (1/2) */}
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <TeacherMoneyTable
              rows={money.teachers}
              isLoading={money.isLoading}
            />
            <CompletionDonut
              segments={statusData}
              completion={overallCompletion}
              period={period}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
