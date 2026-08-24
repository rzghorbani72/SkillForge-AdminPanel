export type LessonType =
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'TEXT'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'LIVE';

export type CourseMedia = {
  id: string;
  publicUrl?: string | null;
  title?: string | null;
  alt?: string | null;
  mime_type?: string | null;
};

export type CourseDetailLesson = {
  id: string;
  title: string;
  description: string | null;
  content?: string | null;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  lesson_type: LessonType;
  order: number;
  video_id?: string | null;
  audio_id?: string | null;
  document_id?: string | null;
  image_id?: string | null;
  Video: CourseMedia | null;
  Audio: CourseMedia | null;
  Document: CourseMedia | null;
  Image: CourseMedia | null;
};

export type CourseDetailSeason = {
  id: string;
  title: string;
  order: number;
  description: string | null;
  Lesson: CourseDetailLesson[];
};

export type CourseAccessControl = {
  can_modify: boolean;
  can_delete: boolean;
  can_view: boolean;
  is_owner: boolean;
  user_role: string;
  user_permissions: string[];
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  slug: string | null;
  price: number;
  original_price: number;
  discount_percent: number | null;
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  is_certificate: boolean;
  /** LIVE = sold as a timetable of classes; OFFLINE = recorded lessons. */
  course_type?: 'OFFLINE' | 'LIVE';
  access_duration_days: number | null;
  author_id: string;
  academy_id: string;
  created_at: string;
  updated_at: string;
  Profile: { id: string; display_name: string } | null;
  Category: { id: string; name: string } | null;
  Image: CourseMedia | null;
  Video: CourseMedia | null;
  Audio: CourseMedia | null;
  Season: CourseDetailSeason[];
  access_control?: CourseAccessControl;
  availability?: string;
  active_enrollment_count?: number;
};

export type CoursePayment = {
  id: string;
  amount: number | null;
  status: string;
  paid_at?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
};

export type CourseEnrollment = {
  id: string;
  status?: string | null;
  enrolled_at?: string | null;
  user?: { display_name?: string | null } | null;
  profile?: { display_name?: string | null } | null;
};

const MONEY_ROLES = ['ADMIN', 'MANAGER', 'OWNER', 'PLATFORM_OWNER'];

/**
 * Money belongs to the academy manager and to the teacher who owns this course.
 * `is_owner` is set by the backend when the viewer is the course's author.
 * This is presentation only — the payments endpoint must enforce the same rule.
 */
export function canViewCourseMoney(course: CourseDetail): boolean {
  const access = course.access_control;
  if (!access) return false;
  if (MONEY_ROLES.includes(access.user_role)) return true;
  return access.user_role === 'TEACHER' && access.is_owner;
}

export function countLessons(seasons: CourseDetailSeason[]): number {
  return seasons.reduce((total, season) => total + season.Lesson.length, 0);
}
