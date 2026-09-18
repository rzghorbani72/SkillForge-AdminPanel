import { expect, test } from '@playwright/test';
import { EMPTY_MANAGER_DASHBOARD } from '@/types/dashboard';
import { buildDashboardReport } from '@/components/dashboard/build-dashboard-report';

const t = (key: string) => key;

const sample = {
  academyName: 'Frontend Academy',
  academySlug: 'frontend',
  period: '30d' as const,
  periodLabel: '30 days',
  periodStart: '2026-08-19',
  periodEnd: '2026-09-18',
  money: { ...EMPTY_MANAGER_DASHBOARD.money, gross: 1_500_000, net: 1_200_000 },
  payoutsDue: { count: 2, amount: 300_000 },
  teacherSharePercent: 20,
  settlement: null,
  limits: [{ key: 'courses' as const, used: 3, limit: 10, remaining: 7 }],
  series: [
    {
      label: 'Week 1',
      gross: 100,
      refunds: 0,
      discounts: 0,
      teacher_payouts: 20,
      net: 80,
    },
  ],
  courses: [
    {
      course_id: 'c1',
      title: 'React, Next.js',
      teacher_name: 'Ada',
      students: 12,
      sales: 12,
      gross: 100,
      teacher_payout: 20,
      net: 80,
      refunds: 0,
      avg_progress: 40,
    },
  ],
  teachers: [
    {
      profile_id: 't1',
      name: 'Ada',
      courses: 1,
      students: 12,
      gross: 100,
      earnings: 20,
      pending_payout: 20,
    },
  ],
  totalCourses: 3,
  totalStudents: 40,
  activeEnrollments: 12,
  overallCompletion: 25,
  journey: [
    { key: 'students' as const, value: 40 },
    { key: 'enrolled' as const, value: 12 },
    { key: 'active' as const, value: 8 },
    { key: 'completed' as const, value: 3 },
  ],
  status: [
    { key: 'completed' as const, value: 25 },
    { key: 'inProgress' as const, value: 50 },
    { key: 'notStarted' as const, value: 10 },
    { key: 'ended' as const, value: 15 },
  ],
};

test.describe('dashboard report CSV', () => {
  test('writes a UTF-8 BOM, section markers, and escaped titles', () => {
    const { csv, filename } = buildDashboardReport(sample, t);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('## dashboard.export.summary');
    expect(csv).toContain('## dashboard.money.coursesTitle');
    expect(csv).toContain('"React, Next.js"');
    expect(csv).toContain('1500000');
    expect(filename).toMatch(/^mentoma-dashboard-frontend-30d-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
