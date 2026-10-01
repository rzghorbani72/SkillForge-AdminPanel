import type { Academy, CurrencyCode, Profile, User } from './part-1';
import type { Course, Lesson } from './part-2';

// Enrollment and Progress Types
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  enrolled_at: string;
  completed_at?: string;
  progress_percent?: number;
  user?: User;
  course?: Course;
  /** Prisma include casing from some list endpoints. */
  Course?: Course;
  progress?: Progress[];
  payments?: Payment[];
}

export interface Progress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress_percentage: number;
  time_spent: number;
  last_accessed_at: string;
  completed_at?: string;
  user?: User;
  lesson?: Lesson;
}

// Payment and Transaction Types
export interface Payment {
  id: string;
  uuid?: string;
  user_id: string;
  course_id: string;
  profile_id?: number;
  order_id?: number | null;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  method?:
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'BANK_TRANSFER'
    | 'DIGITAL_WALLET'
    | 'ONLINE'
    | 'OFFLINE'
    | 'WALLET';
  payment_method?: string;
  provider?: string;
  payment_gateway_id?: number | null;
  gateway?: string | null;
  gateway_id?: string | null;
  authority?: string | null;
  checkout_reference?: string | null;
  transaction_id?: string;
  payment_date?: string;
  paid_at?: string | null;
  notes?: string | null;
  failure_reason?: string | null;
  refund_amount?: number | null;
  refund_reason?: string | null;
  platform_fee?: number | null;
  instructor_fee?: number | null;
  affiliate_fee?: number | null;
  coupon_code?: string | null;
  discount_amount?: number | null;
  discount_code_id?: number | null;
  created_at?: string;
  updated_at?: string;
  refund_date?: string;
  user?: User;
  Profile?: Profile;
  course?: Course;
  Course?: Course;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
  uuid?: string;
  payment_id: number;
  amount: number;
  currency: string;
  type: 'PAYMENT' | 'REFUND' | 'CHARGEBACK';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  gateway: string;
  gateway_transaction_id: string;
  created_at: string;
  updated_at: string;
  payment?: Payment;
}

// Theme Types
export interface Theme {
  id: number;
  name: string;
  description?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  academy_id: string;
  created_at: string;
  updated_at: string;
  academy?: Academy;
}

// UI Template Types
export interface UIBlockConfig {
  id: string;
  type:
    | 'header'
    | 'hero'
    | 'features'
    | 'courses'
    | 'testimonials'
    | 'footer'
    | 'sidebar'
    | 'slideshow'
    | 'videos'
    | 'membership'
    | 'marquee'
    | 'course-grid'
    | 'pricing'
    | 'cta'
    | 'categories'
    | 'projects'
    | 'placeholder';
  order: number;
  isVisible: boolean;
  config?: Record<string, any>;
}

export interface UITemplate {
  id: number;
  academy_id: string;
  blocks: UIBlockConfig[];
  draft_blocks?: UIBlockConfig[];
  template_preset?: string;
  draft_template_preset?: string | null;
  is_active: boolean;
  has_unpublished_changes?: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  academy?: Academy;
}

export type TemplateVisibility = 'PUBLIC' | 'DEDICATED';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
  theme?: Record<string, string> | null;
  visibility?: TemplateVisibility;
  isOwned?: boolean;
  /** For a DEDICATED copy: the public preset it was forked from. */
  sourcePresetKey?: string | null;
  /** Average of every academy's stars; also drives the gallery order. */
  rating?: number;
  ratingCount?: number;
  /** This academy's own vote, or null when it has not rated the template. */
  myRating?: number | null;
}

export interface PricingConfig {
  title: string;
  subtitle: string;
  cta_label: string;
}

// Session and OTP Types
export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  user?: User;
}

/** A live login session (one device), as returned by GET /auth/sessions. */
export interface ActiveSession {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  is_current: boolean;
}

export interface Otp {
  id: number;
  user_id: number;
  code: string;
  type: 'EMAIL' | 'PHONE';
  expires_at: string;
  is_used: boolean;
  created_at: string;
  user?: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form Data Types
export interface CreateStoreData {
  name: string;
  private_domain: string;
  description?: string;
}

export interface UpdateStoreData {
  name?: string;
  private_domain?: string;
  description?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  meta_tags: Array<{ title: string; content: string }>;
  primary_price: number;
  secondary_price: number;
  currency: CurrencyCode;
  category_id?: number;
  season_id?: number;
  audio_id?: number;
  video_id?: number;
  image_id?: number;
  published?: boolean;
}

export interface CreateLessonData {
  title: string;
  description: string;
  content?: string;
  duration?: number;
  course_id: number;
  season_id?: number;
  media_id?: number;
}

export interface CreateSeasonData {
  title: string;
  description?: string;
  course_id: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  type?: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'IMAGE' | 'ROOT';
}

export interface UpdateProfileData {
  display_name?: string;
  bio?: string;
  avatar_id?: number;
}

// Filter and Query Types
export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  academy_id?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  is_free?: boolean;
  is_published?: boolean;
}

export interface LessonFilters {
  course_id?: number;
  season_id?: number;
  page?: number;
  limit?: number;
  search?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeEnrollments: number;
  recentCourses: Course[];
  recentEnrollments: Enrollment[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

// File Upload Types
export interface FileUploadResponse {
  id: number;
  title: string;
  filename: string;
  publicUrl: string;
  mime_type: string;
  size: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
}

// Financial Management Types
export type FormulaScope = 'STORE' | 'PLATFORM';
