export type DashboardPeriodKey = '7d' | '30d' | '3m' | '1y';

export interface MoneyBucket {
  label: string;
  gross: number;
  refunds: number;
  discounts: number;
  teacher_payouts: number;
  net: number;
}

export interface MoneySummary {
  gross: number;
  refunds: number;
  discounts: number;
  teacher_payouts: number;
  teacher_paid: number;
  net: number;
  gross_previous: number;
  net_previous: number;
}

export interface PayoutsDueSummary {
  count: number;
  amount: number;
}

export interface CourseMoneyRow {
  course_id: string;
  title: string;
  teacher_name: string | null;
  students: number;
  sales: number;
  gross: number;
  teacher_payout: number;
  net: number;
  refunds: number;
  avg_progress: number;
}

export interface TeacherMoneyRow {
  profile_id: string;
  name: string | null;
  courses: number;
  students: number;
  gross: number;
  earnings: number;
  pending_payout: number;
}

export type PlanLimitKey =
  | 'managers'
  | 'teachers'
  | 'courses'
  | 'seasons_per_course'
  | 'lessons_per_course'
  | 'tutoring_students'
  | 'storage_gb'
  | 'monthly_traffic_gb'
  | 'videos'
  | 'dedicated_templates';

export interface PlanLimitUsage {
  key: PlanLimitKey;
  used: number;
  limit: number;
  remaining: number;
}

export interface ManagerDashboard {
  period: { start: string; end: string; grain: 'day' | 'week' | 'month' };
  money: MoneySummary;
  payouts_due: PayoutsDueSummary;
  limits: PlanLimitUsage[];
  series: MoneyBucket[];
  courses: CourseMoneyRow[];
  teachers: TeacherMoneyRow[];
}

export const EMPTY_MANAGER_DASHBOARD: ManagerDashboard = {
  period: { start: '', end: '', grain: 'day' },
  money: {
    gross: 0,
    refunds: 0,
    discounts: 0,
    teacher_payouts: 0,
    teacher_paid: 0,
    net: 0,
    gross_previous: 0,
    net_previous: 0
  },
  payouts_due: { count: 0, amount: 0 },
  limits: [],
  series: [],
  courses: [],
  teachers: []
};
