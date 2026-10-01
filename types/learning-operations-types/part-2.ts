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
  regenerate?: boolean;
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
  /** Came from a paid 1:1 that moved into this class. */
  moved_from_private?: boolean;
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
  /** Per-seat price; null = the course's per-seat offer price. */
  seat_price?: number | null;
  /** May one buyer reserve every seat (a private booking of the class)? */
  whole_class_booking?: boolean;
  seats_taken: number;
  seats_left?: number;
  /** Seats held at checkout right now; back on sale after 10 minutes unpaid. */
  seats_held?: number;
  age_min?: number | null;
  age_max?: number | null;
  visibility: TutoringGroupVisibility;
  join_code?: string | null;
  term_weeks: number;
  join_deadline?: string | null;
  status: TutoringGroupStatus;
  /** 'MINIMUM_NOT_REACHED' when the deadline passed short of the minimum. */
  cancel_reason?: string | null;
  /** Store credit the cancel gave back; only on a cancelled class. */
  refunds?: { students: number; amount: number } | null;
  meeting_url?: string | null;
  meeting_url_source?: 'MANUAL' | 'AUTO_JITSI';
  meeting_url_updated_at?: string | null;
  backup_meeting_url?: string | null;
  starts_on?: string | null;
  /** The date the manager asked for; the only date a draft class has. */
  starts_on_requested?: string | null;
  session_count?: number | null;
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
  seat_price?: number;
  whole_class_booking?: boolean;
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

export type ClassRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type ClassSessionCancelResolution = 'MAKEUP' | 'REFUND';

export type CancelClassSessionPayload = {
  resolution?: ClassSessionCancelResolution;
  makeup_starts_at?: string;
  makeup_ends_at?: string;
  reason?: string;
};

export type CancelClassSessionResult = {
  session: ClassSession;
  makeup: ClassSession | null;
};

export type CancelMemberKind = 'PAID' | 'VOUCHER' | 'GRANTED';

export type CancelClassMember = {
  engagement_id: string;
  student_profile_id: string;
  display_name: string | null;
  seats_claimed: number;
  paid_amount: number;
  credit: number;
  kind: CancelMemberKind;
};

export type CancelInviteGroup = {
  id: string;
  title: string;
  status: string;
  seats_left: number;
};

export type CancelClassPreview = {
  members: CancelClassMember[];
  invite_groups: CancelInviteGroup[];
};

export type CancelTutoringGroupPayload = {
  reason?: string;
  invite_profile_ids?: string[];
  invite_group_id?: string;
};

export type CancelTutoringGroupResult = {
  credits: number;
  complimentary: number;
  invited: number;
  invite_failed: number;
};

export interface ClassRequestWindow {
  weekday: number;
  start_minute: number;
  end_minute: number;
}

/** A student asking for a class at times that suit them. */
export interface ClassRequest {
  id: string;
  course_id: string;
  seats: number;
  windows: ClassRequestWindow[];
  note: string | null;
  status: ClassRequestStatus;
  group_id: string | null;
  /** Set when a paid private student asked from inside their classroom. */
  engagement_id: string | null;
  answered_at: string | null;
  created_at: string;
  Course: { id: string; title: string; slug: string | null } | null;
  Student: { id: string; display_name: string | null } | null;
  Group: { id: string; title: string; status: TutoringGroupStatus } | null;
}

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
