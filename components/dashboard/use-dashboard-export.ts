'use client';

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiErrorMessage } from '@/lib/api-error-message';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';
import type { SettlementSummary } from '@/lib/api-settlement';
import type { ManagerDashboard } from '@/types/dashboard';
import type { JourneyStep, StatusSegment } from './dashboard-metrics';
import { buildDashboardReport } from './build-dashboard-report';
import { downloadTextFile } from './dashboard-csv';

type Props = {
  period: string;
  periodLabel: string;
  money: ManagerDashboard;
  settlement: SettlementSummary | null;
  totalCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  overallCompletion: number;
  journey: JourneyStep[];
  status: StatusSegment[];
};

export function useDashboardExport({
  period,
  periodLabel,
  money,
  settlement,
  totalCourses,
  totalStudents,
  activeEnrollments,
  overallCompletion,
  journey,
  status,
}: Props) {
  const { t } = useTranslation();
  const { selectedAcademy } = useStore();

  const exportReport = useCallback(() => {
    try {
      const rate = selectedAcademy?.teacher_share_rate ?? 0;
      const { csv, filename } = buildDashboardReport(
        {
          academyName: selectedAcademy?.name ?? '',
          academySlug: selectedAcademy?.slug ?? '',
          period,
          periodLabel,
          periodStart: money.period.start,
          periodEnd: money.period.end,
          money: money.money,
          payoutsDue: money.payouts_due,
          teacherSharePercent: Math.round(rate * 100),
          settlement,
          limits: money.limits,
          series: money.series,
          courses: money.courses,
          teachers: money.teachers,
          totalCourses,
          totalStudents,
          activeEnrollments,
          overallCompletion,
          journey,
          status,
        },
        t,
      );
      downloadTextFile(csv, filename);
      logger.ok('Dashboard', 'ReportExported', {
        period,
        course_count: money.courses.length,
        teacher_count: money.teachers.length,
      });
      toast.success(t('dashboard.export.success'));
    } catch (err) {
      logger.error('Dashboard', 'ReportExportFailed', errorFields(err));
      toast.error(apiErrorMessage(err, t('dashboard.export.failed')));
    }
  }, [
    activeEnrollments,
    journey,
    money,
    overallCompletion,
    period,
    periodLabel,
    selectedAcademy,
    settlement,
    status,
    t,
    totalCourses,
    totalStudents,
  ]);

  return { exportReport };
}
