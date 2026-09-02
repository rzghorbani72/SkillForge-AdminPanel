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

export type TutoringEngagementStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'EXPIRED';

export type TutoringSessionStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

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
}

export interface TutoringSession {
  id: string;
  engagement_id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  meeting_url?: string | null;
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

export interface CreateTutoringEngagementPayload {
  course_id: string;
  student_profile_id: string;
  tutor_profile_id: string;
  offer_id?: string;
  payment_id?: string;
  subscription_id?: string;
  ends_at?: string;
}

export interface ScheduleTutoringSessionPayload {
  engagement_id: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  meeting_url?: string;
  notes?: string;
}

export interface RescheduleTutoringSessionPayload {
  starts_at: string;
  ends_at?: string;
  meeting_url?: string;
  notes?: string;
}

export interface UpdateLessonDownloadPolicyPayload {
  allow_download_free?: boolean;
  allow_download_enrollment?: boolean;
  allow_download_subscription?: boolean;
  allow_download_tutoring?: boolean;
}

// ─── Group classes ───────────────────────────────────────────────────────────

export type TutoringGroupStatus =
  | 'DRAFT'
  | 'WAITING'
  | 'CONFIRMED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELLED';

export type TutoringGroupVisibility = 'PUBLIC' | 'PRIVATE';

export interface TutoringGroupSlot {
  id?: string;
  /** 0 = Sunday, same index space as Date.getDay() */
  weekday: number;
  /** Minutes after local midnight in the class timezone: 15:00 -> 900 */
  start_minute: number;
  duration_minutes: number;
  lesson_id?: string | null;
  Lesson?: { id: string; title: string } | null;
}

export interface TutoringGroupMember {
  id: string;
  status: string;
  seats_claimed: number;
  created_at: string;
  Student?: { id: string; display_name: string | null } | null;
}

export interface TutoringGroupSession {
  id: string;
  starts_at: string;
  ends_at?: string | null;
  status: string;
  lesson_id?: string | null;
}

export interface TutoringGroup {
  id: string;
  academy_id: string;
  course_id: string;
  tutor_profile_id: string;
  offer_id: string;
  title: string;
  description?: string | null;
  timezone: string;
  capacity: number;
  min_students: number;
  seats_taken: number;
  seats_left?: number;
  age_min?: number | null;
  age_max?: number | null;
  visibility: TutoringGroupVisibility;
  join_code?: string | null;
  term_weeks: number;
  join_deadline?: string | null;
  status: TutoringGroupStatus;
  meeting_url?: string | null;
  meeting_url_updated_at?: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
  Slots?: TutoringGroupSlot[];
  Course?: { id: string; title: string } | null;
  Tutor?: { id: string; display_name: string | null } | null;
  Offer?: { id: string; price: number; currency: string } | null;
  members?: TutoringGroupMember[];
  sessions?: TutoringGroupSession[];
}

export interface CreateTutoringGroupPayload {
  offer_id: string;
  title: string;
  description?: string;
  timezone: string;
  capacity: number;
  min_students: number;
  age_min?: number;
  age_max?: number;
  visibility?: TutoringGroupVisibility;
  /** Optional once session_count is given: the teacher counts meetings. */
  term_weeks?: number;
  session_count?: number;
  starts_on_requested?: string;
  join_deadline?: string;
  meeting_url?: string;
  slots: TutoringGroupSlot[];
}

export type UpdateTutoringGroupPayload = Partial<
  Omit<CreateTutoringGroupPayload, 'offer_id' | 'slots' | 'timezone'>
>;

export interface CourseTopic {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

export interface SessionRecording {
  video_id: string;
  title: string;
  duration: number | null;
  poster_url: string | null;
  can_download: boolean;
  url: string | null;
}

/** A handout or helper video the teacher left alongside one meeting. */
export interface SessionMaterial {
  id: string;
  title: string;
  order: number;
  kind: 'DOCUMENT' | 'VIDEO';
  url: string | null;
  can_download: boolean;
  mime_type: string | null;
  size: number | null;
  duration: number | null;
  poster_url: string | null;
}

/** Exactly one of these identifies the thread a message belongs to. */
export interface DiscussionParent {
  attempt_id?: string;
  submission_id?: string;
  engagement_id?: string;
  tutoring_session_id?: string;
  tutoring_group_id?: string;
}

export interface ClassSession {
  id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  status: string;
  title: string | null;
  notes: string | null;
  topic_id: string | null;
  /** Null falls back to the class-wide link. */
  meeting_url: string | null;
  Topic: { id: string; title: string } | null;
  Materials?: SessionMaterial[];
  recording_video_id?: string | null;
  recording_allow_download?: boolean;
}

export interface CertificateRequirementTally {
  total: number;
  done: number;
}

export interface CertificateEligibility {
  enrollment_id: string;
  profile_id: string;
  course_id: string;
  eligible: boolean;
  min_percent: number;
  lessons: CertificateRequirementTally;
  quizzes: CertificateRequirementTally;
  assignments: CertificateRequirementTally;
  blockers: string[];
}

export interface IssuedCertificate {
  id: string;
  profile_id: string;
  certificate_number: string;
  issued_at: string;
  is_valid: boolean;
}

export interface CertificateRosterStudent {
  enrollment_id: string;
  profile_id: string;
  display_name: string | null;
  status: string;
  progress_percent: number;
  eligibility: CertificateEligibility | null;
  certificate: IssuedCertificate | null;
}

export interface CertificateRoster {
  course: {
    id: string;
    title: string;
    is_certificate: boolean;
    certificate_min_percent: number;
  };
  students: CertificateRosterStudent[];
}
