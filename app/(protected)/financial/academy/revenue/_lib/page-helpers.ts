export interface RevenueVisibility {
  can_view_store_revenue: boolean;
  can_view_teacher_revenue: boolean;
  can_view_platform_revenue: boolean;
}

export interface TeacherRevenueRow {
  teacher_id: number;
  teacher_name?: string;
  payment_count?: number;
  payout_revenue?: number;
  revenue_visible?: boolean;
}

export interface RevenueMetrics {
  currency: string;
  school_net_revenue?: number;
  teacher_gross_revenue?: number;
  teacher_payout_revenue?: number;
  teacher_payout?: number;
  platform_revenue?: number;
  message?: string;
  teacher_revenue_breakdown?: TeacherRevenueRow[];
}

export interface MonetizationSummary {
  role: string;
  visibility: RevenueVisibility;
  metrics: RevenueMetrics;
}

export interface CourseRevenueBucket {
  course: string;
  count: number;
  total: number;
  currency: string;
}
