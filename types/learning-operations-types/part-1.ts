import type { Enrollment, User } from '@/types/api';

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  pagination?: ApiPagination;
}

export interface GroupedUsersResponse {
  data?: {
    grouped?: {
      managers?: User[];
      teachers?: User[];
      students?: User[];
      users?: User[];
    };
    totals?: {
      managers: number;
      teachers: number;
      students: number;
      users: number;
      total: number;
    };
  };
}

export interface LearningAssignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  max_score: number;
  is_required: boolean;
  /** Exactly one parent is set: a lesson, a whole class, or one meeting. */
  lesson_id?: string | null;
  tutoring_group_id?: string | null;
  tutoring_session_id?: string | null;
  Lesson?: {
    id: string;
    title: string;
    Course?: { id: string; title: string };
    Season?: { id: string; title: string; course_id: string };
  };
  TutoringGroup?: {
    id: string;
    title: string;
    Course?: { id: string; title: string };
  } | null;
  TutoringSession?: {
    id: string;
    title: string | null;
    starts_at: string;
    Group?: { id: string; title: string } | null;
  } | null;
  _count?: { Submission: number };
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'REJECTED';

export interface AssignmentSubmission {
  id: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  content?: string;
  file_url?: string;
  image_ids?: string[];
  discussion_thread_id?: string;
  enrollment_id?: string;
  /** Recorded, never blocking — a late hand-in is still accepted. */
  is_late?: boolean;
  Assignment?: {
    id: string;
    title: string;
    max_score: number;
    due_date?: string | null;
    Lesson?: {
      Course?: { id: string; title: string };
      Season?: { id: string; title: string };
    };
  };
  Profile?: {
    id: string;
    display_name: string;
  };
  GradedBy?: {
    id: string;
    display_name: string;
  };
}

export interface AssignmentListResponse {
  assignments: LearningAssignment[];
  pagination?: ApiPagination;
}

export interface SubmissionListResponse {
  submissions: AssignmentSubmission[];
  pagination?: ApiPagination;
}

export type LearningActivityType =
  | 'VIDEO_HEARTBEAT'
  | 'LESSON_OPENED'
  | 'LESSON_COMPLETED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'QUIZ_ATTEMPTED'
  | 'QUIZ_GRADED'
  | 'ATTENDANCE_MARKED'
  | 'ENROLLMENT_ACTIVATED'
  | string;

export interface LearningActivity {
  id: string;
  activity_type: LearningActivityType;
  payload: unknown;
  created_at: string;
  enrollment_id: string | null;
  course_id: string | null;
  lesson_id: string | null;
  engagement_id: string | null;
}

export interface LearningTimelineResponse {
  activities: LearningActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LearningSummaryEnrollment {
  id: string;
  course_id: string;
  progress_percent: number | null;
  status: string;
  last_accessed: string | null;
  video_heartbeats: number;
  Course: { id: string; title: string } | null;
}

export interface LearningSummaryResponse {
  enrollments: LearningSummaryEnrollment[];
}

export interface OpsOverdueGradingItem {
  id: string | number;
  submitted_at: string | null;
  profile_id: string;
  Profile: { display_name: string | null } | null;
  Assignment: { id: string | number; title: string } | null;
}

export interface OpsInactivityItem {
  id: string;
  profile_id: string;
  course_id: string;
  last_accessed: string | null;
  progress_percent: number | null;
  Profile: { display_name: string | null } | null;
  Course: { title: string } | null;
}

export interface OpsLowScoreItem {
  id: string | number;
  score: number | null;
  profile_id: string;
  Profile: { display_name: string | null } | null;
  Assignment: {
    id: string | number;
    title: string;
    max_score: number;
  } | null;
}

export interface OpsMissedClassItem {
  id: string;
  profile_id: string;
  tutoring_session_id: string;
  created_at: string;
  Profile: { display_name: string | null } | null;
  Session: { starts_at: string } | null;
}

export interface OpsUnansweredThreadItem {
  id: string;
  context_type: string;
  profile_id: string;
  profile_name: string;
  last_message_at: string;
}

export interface OpsQueueResponse {
  overdue_grading: OpsOverdueGradingItem[];
  inactivity: OpsInactivityItem[];
  low_scores: OpsLowScoreItem[];
  missed_classes: OpsMissedClassItem[];
  unanswered_threads: OpsUnansweredThreadItem[];
}

export interface CreateInterventionNotePayload {
  profile_id: string;
  note: string;
  follow_up_at?: string;
  course_id?: string;
  enrollment_id?: string;
}

export interface InterventionNoteResult {
  id: string;
  created_at: string;
}

export type TutoringEngagementStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export type TutoringSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type TutoringAttendanceStatus = 'JOINED' | 'PRESENT' | 'ABSENT';

export type TutoringOfferKind = 'SOLO' | 'GROUP';

export interface TutoringOffer {
  id: string;
  /** SOLO = the 1:1 price, GROUP = the per-seat price of a class. */
  kind: TutoringOfferKind;
  academy_id: string;
  course_id: string;
  tutor_profile_id: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  sessions_included?: number | null;
  duration_days?: number | null;
  status: string;
  is_active: boolean;
  Course?: { id: string; title: string } | null;
  Tutor?: { id: string; display_name: string | null } | null;
}

export interface UpdateTutoringOfferPayload {
  title?: string;
  description?: string;
  price?: number;
  sessions_included?: number;
  duration_days?: number;
  is_active?: boolean;
}

export interface TutoringEngagement {
  id: string;
  academy_id: string;
  course_id: string;
  student_profile_id: string;
  tutor_profile_id: string;
  enrollment_id: string;
  offer_id?: string | null;
  payment_id?: string | null;
  subscription_id?: string | null;
  status: TutoringEngagementStatus;
  activated_at: string | null;
  ends_at: string | null;
  cancelled_at?: string | null;
  updated_at?: string;
  Course?: { id: string; title: string } | null;
  Student?: { id: string; display_name: string | null } | null;
  Tutor?: { id: string; display_name: string | null } | null;
  Group?: { id: string; title: string } | null;
  /** What the 1:1 was paid, pre-VAT. */
  paid_value?: number;
  /** Set when a paid 1:1 moved into this class. */
  moved_to_group_id?: string | null;
  credit_granted?: number;
}

export interface TutoringSession {
  id: string;
  engagement_id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  meeting_url?: string | null;
  meeting_url_source?: 'MANUAL' | 'AUTO_JITSI';
  notes?: string | null;
  status: TutoringSessionStatus;
}

export interface TutoringSessionListItem {
  id: string;
  starts_at: string;
  status: TutoringSessionStatus;
  engagement_id: string;
  Course: { id: string; title: string } | null;
  Student: { id: string; display_name: string | null } | null;
}

export interface LessonDownloadPolicy {
  id: string;
  allow_download_free: boolean;
  allow_download_enrollment: boolean;
  allow_download_subscription: boolean;
  allow_download_tutoring: boolean;
}

export interface CreateTutoringOfferPayload {
  course_id: string;
  tutor_profile_id: string;
  kind?: TutoringOfferKind;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  sessions_included?: number;
  duration_days?: number;
}
