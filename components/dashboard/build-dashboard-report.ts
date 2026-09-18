import type { SettlementSummary } from '@/lib/api-settlement';
import type {
  CourseMoneyRow,
  MoneyBucket,
  MoneySummary,
  PayoutsDueSummary,
  PlanLimitUsage,
  TeacherMoneyRow,
} from '@/types/dashboard';
import { toBundleCsv, type CsvSection, type CsvValue } from './dashboard-csv';
import type { JourneyStep, StatusSegment } from './dashboard-metrics';

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export type DashboardReportInput = {
  academyName: string;
  academySlug: string;
  period: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  money: MoneySummary;
  payoutsDue: PayoutsDueSummary;
  teacherSharePercent: number;
  settlement: SettlementSummary | null;
  limits: PlanLimitUsage[];
  series: MoneyBucket[];
  courses: CourseMoneyRow[];
  teachers: TeacherMoneyRow[];
  totalCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  overallCompletion: number;
  journey: JourneyStep[];
  status: StatusSegment[];
};

function fileSafe(value: string): string {
  const ascii = value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return ascii.slice(0, 40) || 'academy';
}

function kv(
  t: TranslateFn,
  rows: ReadonlyArray<readonly [string, CsvValue]>,
): Array<Record<string, CsvValue>> {
  const metric = t('dashboard.export.metric');
  const value = t('dashboard.export.value');
  return rows.map(([label, val]) => ({ [metric]: label, [value]: val ?? '' }));
}

export function buildDashboardReport(
  input: DashboardReportInput,
  t: TranslateFn,
): { csv: string; filename: string } {
  const unnamed = t('dashboard.money.unnamed');
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `mentoma-dashboard-${fileSafe(input.academySlug || input.academyName)}-${input.period}-${stamp}.csv`;

  const sections: CsvSection[] = [
    {
      name: t('dashboard.export.summary'),
      rows: kv(t, [
        [t('dashboard.export.academy'), input.academyName],
        [t('dashboard.export.period'), input.periodLabel],
        [t('dashboard.export.from'), input.periodStart],
        [t('dashboard.export.to'), input.periodEnd],
        [t('dashboard.cards.courses'), input.totalCourses],
        [t('dashboard.cards.students'), input.totalStudents],
        [t('dashboard.cards.active'), input.activeEnrollments],
        [t('dashboard.cards.completion'), input.overallCompletion],
      ]),
    },
    {
      name: t('dashboard.money.academyRow'),
      rows: kv(t, [
        [t('dashboard.money.gross'), input.money.gross],
        [t('dashboard.money.colRefunds'), input.money.refunds],
        [t('dashboard.export.discounts'), input.money.discounts],
        [t('dashboard.money.net'), input.money.net],
        [t('dashboard.money.teacherShare'), input.money.teacher_payouts],
        [t('dashboard.money.teacherPaid'), input.money.teacher_paid],
        [t('dashboard.money.payoutsDue'), input.payoutsDue.amount],
        [t('dashboard.money.teacherRate'), input.teacherSharePercent],
      ]),
    },
    {
      name: t('dashboard.export.settlement'),
      rows: kv(t, [
        [t('dashboard.money.platformOwes'), input.settlement?.balance.available ?? 0],
        [t('dashboard.export.pendingTransfer'), input.settlement?.balance.pending ?? 0],
        [t('dashboard.money.paidToAcademy'), input.settlement?.balance.withdrawn_total ?? 0],
      ]),
    },
    {
      name: t('dashboard.money.flowTitle'),
      rows: input.series.map((bucket) => ({
        [t('dashboard.export.bucket')]: bucket.label,
        [t('dashboard.money.colGross')]: bucket.gross,
        [t('dashboard.money.colRefunds')]: bucket.refunds,
        [t('dashboard.export.discounts')]: bucket.discounts,
        [t('dashboard.money.colPayout')]: bucket.teacher_payouts,
        [t('dashboard.money.colNet')]: bucket.net,
      })),
    },
    {
      name: t('dashboard.limits.title'),
      rows: input.limits.map((limit) => ({
        [t('dashboard.export.metric')]: t(`dashboard.limits.${limit.key}`),
        [t('dashboard.export.used')]: limit.used,
        [t('dashboard.export.limit')]: limit.limit,
        [t('dashboard.export.remaining')]: limit.remaining,
      })),
    },
    {
      name: t('dashboard.export.journeyTitle'),
      rows: input.journey.map((step) => ({
        [t('dashboard.export.metric')]: t(`dashboard.export.journey.${step.key}`),
        [t('dashboard.export.value')]: step.value,
      })),
    },
    {
      name: t('dashboard.export.progressTitle'),
      rows: input.status.map((segment) => ({
        [t('dashboard.export.metric')]: t(`dashboard.export.status.${segment.key}`),
        [t('dashboard.export.value')]: segment.value,
      })),
    },
    {
      name: t('dashboard.money.coursesTitle'),
      rows: input.courses.map((row) => ({
        [t('dashboard.money.colCourse')]: row.title || unnamed,
        [t('dashboard.money.colTeacher')]: row.teacher_name || unnamed,
        [t('dashboard.money.colStudents')]: row.students,
        [t('dashboard.money.colSales')]: row.sales,
        [t('dashboard.money.colGross')]: row.gross,
        [t('dashboard.money.colPayout')]: row.teacher_payout,
        [t('dashboard.money.colNet')]: row.net,
        [t('dashboard.money.colRefunds')]: row.refunds,
        [t('dashboard.money.colProgress')]: row.avg_progress,
      })),
    },
    {
      name: t('dashboard.money.teachersTitle'),
      rows: input.teachers.map((row) => ({
        [t('dashboard.money.colTeacher')]: row.name || unnamed,
        [t('dashboard.money.colCourses')]: row.courses,
        [t('dashboard.money.colStudents')]: row.students,
        [t('dashboard.money.colGross')]: row.gross,
        [t('dashboard.money.colEarnings')]: row.earnings,
        [t('dashboard.money.colPending')]: row.pending_payout,
      })),
    },
  ];

  return { csv: toBundleCsv(sections), filename };
}
