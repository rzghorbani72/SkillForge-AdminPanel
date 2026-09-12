/**
 * Browser-side product-analytics catalog: the UX steps of the manager and
 * student funnels. Money and learning milestones (PlanPaid, StudentPaid,
 * QuizSubmitted, …) are captured server-side in Backend/src/common/analytics,
 * because a gateway redirect means the browser never reliably sees them.
 * Identity (user/academy/role) is attached automatically by identifyAnalytics.
 */
export interface AnalyticsEvents {
  AcademyCreated: { academy_id: string };
  MemberAdded: { role: string; created_account: boolean };
  CourseCreated: { course_id: string; course_type: string };
  SetupStepOpened: { step: string };
  StudentCheckoutStarted: { kind: string; amount_toman: number };
}

export type AnalyticsEvent = keyof AnalyticsEvents;
