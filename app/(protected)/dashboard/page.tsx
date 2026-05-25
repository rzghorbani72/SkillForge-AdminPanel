'use client';

import { Sparkles } from 'lucide-react';
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

export default function DashboardPage() {
  const { t } = useTranslation();

  useInitializeStores();

  const {
    isLoading,
    recentCourses,
    recentActivity,
    statsCards,
    monthlyChartData
  } = useDashboard();

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

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.welcomeBack')}
        </p>
      </div>

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
