/**
 * Gateways the platform can charge a manager through. Owner panel activates
 * exactly one live rail (Saman preferred; BitPay is standby).
 */
export type PaymentGatewayProvider = 'BITPAY' | 'SAMAN_SEP' | 'MELLAT_BP';

/** What a platform owner is resetting when they reset a person. */
export type UserResetMode = 'CREDENTIALS' | 'LEARNING_RECORD' | 'ERASE';

// User Status Type
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

// User and Authentication Types
export interface User {
  /** cuid, never numeric — parsing it with Number() yields NaN. */
  id: string;
  uuid?: string;
  user_uuid?: string;
  email?: string;
  display_name: string;
  /** Legacy alias for display_name */
  name?: string;
  phone_number: string;
  birthday?: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_active: boolean;
  status?: UserStatus;
  /** Set while this person is banned inside one academy. */
  banned_at?: string | null;
  ban_reason?: string | null;
  /** Set while this person is banned across the whole platform. */
  user_banned_at?: string | null;
  user_ban_reason?: string | null;
  /** The platform User behind this academy profile — the target of a platform ban. */
  user_id?: string | null;
  /** Flattened role name returned by the role-scoped list endpoints. */
  role_name?: string;
  /** Human-readable role name; set for custom roles that have no translation key. */
  role_label?: string | null;
  /** Rank of the role (MANAGER=3, TEACHER=2, STUDENT=1); custom roles inherit their creator-picked rank. */
  role_hierarchy_level?: number | null;
  full_name?: string;
  /** The signed-in person's picture, flattened by /auth/me to one ready url. */
  avatar?: { id: string; url: string } | null;
  academy_id?: string | null;
  academy_name?: string | null;
  platform_role?: 'PLATFORM_OWNER' | 'ADMIN' | 'FINANCE' | 'SUPPORT';
  created_at: string;
  /** When this person first joined Mentoma (User.created_at). */
  joined_at?: string | null;
  updated_at: string;
  profiles?: UserProfile[];
}

export type PlatformStaffRoleName =
  | 'PLATFORM_OWNER'
  | 'ADMIN'
  | 'FINANCE'
  | 'SUPPORT';

export interface PlatformStaffRecord {
  id: string;
  display_name: string;
  full_name?: string | null;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
  platform_role: PlatformStaffRoleName;
  created_at: string;
}

export interface PlatformStaffListResponse {
  profiles: PlatformStaffRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PlatformStaffLookup {
  found: boolean;
  already_staff?: boolean;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  is_active?: boolean;
}

// User Profile (embedded in User response from /users endpoints)
export interface UserProfile {
  id: string;
  display_name: string;
  bio?: string;
  avatar_id?: number;
  is_active: boolean;
  academy?: {
    id: number;
    name: string;
    private_domain: string;
  };
  /** @deprecated Same shape as academy from older payloads */
  store?: {
    id: number;
    name: string;
    private_domain: string;
  };
  role: {
    id: number;
    name:
      | 'PLATFORM_OWNER'
      | 'ADMIN'
      | 'FINANCE'
      | 'SUPPORT'
      | 'MANAGER'
      | 'TEACHER'
      | 'STUDENT'
      | 'USER';
    description?: string;
    /** Set on academy-defined roles, whose `name` is an internal code. */
    label?: string | null;
    hierarchy_level?: number | null;
  };
  /** Prisma-style casing variant */
  Role?: {
    id: number;
    name:
      | 'PLATFORM_OWNER'
      | 'ADMIN'
      | 'FINANCE'
      | 'SUPPORT'
      | 'MANAGER'
      | 'TEACHER'
      | 'STUDENT'
      | 'USER';
    description?: string;
    hierarchy_level?: number | null;
  };
  avatar?: Media;
}

export interface Profile {
  id: number;
  user_id: number;
  academy_id: string | null; // Nullable: Admins can have no store
  role_id: number;
  display_name: string;
  bio?: string;
  avatar_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  academy?: Academy;
  Role?: Role;
  /** Some endpoints return lowercase relation name */
  role?: Role;
  avatar?: Media;
  email?: string;
  phone_number?: string;
}

export interface Role {
  id: number;
  name:
    | 'PLATFORM_OWNER'
    | 'ADMIN'
    | 'FINANCE'
    | 'SUPPORT'
    | 'MANAGER'
    | 'TEACHER'
    | 'STUDENT'
    | 'USER';
  description?: string;
  created_at: string;
  updated_at: string;
}

// Store and Domain Types
// Currency configuration
export type CurrencyCode = 'USD' | 'IRR' | 'TL' | 'EUR' | 'GBP' | 'TRY';

export interface ThemeConfigPayload {
  themeId?: number;
  name?: string;
  primary_color: string;
  primary_color_light?: string;
  primary_color_dark?: string;
  secondary_color: string;
  secondary_color_light?: string;
  secondary_color_dark?: string;
  accent_color: string;
  background_color: string;
  background_color_light?: string;
  background_color_dark?: string;
  dark_mode: boolean | null;
  background_animation_type?: string;
  background_animation_speed?: string;
  background_svg_pattern?: string;
  element_animation_style?: string;
  border_radius_style?: string;
  shadow_style?: string;
}

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  is_default: boolean;
}

export interface Academy {
  id: string;
  uuid?: string;
  name: string;
  slug: string;
  domain_id: string;
  /** Sometimes inlined instead of nested domain */
  private_address?: string;
  students_count?: number;
  teachers_count?: number;
  managers_count?: number;
  userRole?: string;
  description?: string;
  logo_id?: string;
  cover_id?: string;
  is_active: boolean;
  /** Set while the manager has taken the public site offline. */
  site_disabled_at?: string | null;
  /** False when platform staff unlisted this academy from the public directory. */
  listed_publicly?: boolean;
  /** Set while platform staff have suspended the academy; data is kept. */
  suspended_at?: string | null;
  suspended_reason?: string | null;
  /** Platform-staff list only: money moved here, so the academy cannot be deleted. */
  has_transactions?: boolean;
  country_code?: string;
  currency?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  subscription_plan?: string;
  subscription_expires?: string;
  primary_verification_method?: 'phone' | 'email';
  /** Decimal 0-1. Manager-set; shown to teachers as their notional earned share. */
  teacher_share_rate?: number;
  available_currencies?: CurrencyConfig[];
  default_currency?: CurrencyCode;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  domain?: Domain;
  /** Present when API returns Prisma relation casing */
  Domain?: Pick<Domain, 'private_address' | 'public_address' | 'id'> &
    Partial<Domain>;
  logo?: { id: string; publicUrl: string } | null;
  favicon?: { id: string; publicUrl: string } | null;
  /** Manager-authored search/share metadata for the public site. */
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: { id: string; publicUrl: string } | null;
  /** Platform-curated landing-page screenshots of this academy's public site. */
  showcase_desktop?: { id: string; publicUrl: string } | null;
  showcase_mobile?: { id: string; publicUrl: string } | null;
  cover?: Media;
  profiles?: Profile[];
  courses?: Course[];
  categories?: Category[];
  themes?: Theme[];
  media?: Media[];
}

export interface Domain {
  id: string;
  private_address: string;
  public_address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  academies?: Academy[];
}

// Media Types
export interface Media {
  id: number;
  title: string;
  description?: string;
  alt?: string;
  filename: string;
  original_name: string;
  publicUrl: string;
  mime_type: string;
  size: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  metadata?: any;
  is_public: boolean;
  owner_id: number;
  academy_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  owner?: User;
  academy?: Academy;
}

// Course and Learning Types
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  /** Author-written search metadata; empty falls back to title/description. */
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string[] | null;
  price: number;
  original_price?: number;
  /** LIVE = sold as a timetable of classes; OFFLINE = recorded lessons. */
  course_type?: 'OFFLINE' | 'LIVE';
  /** Live classes running for this course; live courses count these, not lessons. */
  classes_count?: number;
  /** Live seat prices: GROUP = one seat in the class, SOLO = private. */
  TutoringOffer?: { kind: 'GROUP' | 'SOLO'; price: number }[];
  /** False = the course is not sold at its own price. */
  base_price_active?: boolean;
  // False = secure media: students stream lesson video/audio but cannot save it.
  allow_downloads?: boolean;
  discount_percent?: number;
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  is_certificate?: boolean;
  cover_id?: number;
  author_id: number;
  academy_id: string;
  category_id?: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  access_duration_days?: number | null;
  duration?: number;
  lessons_count: number;
  students_count: number;
  /** Present on some analytics/list payloads */
  enrollments_count?: number;
  rating: number;
  rating_count: number;
  language?: string;
  requirements?: string;
  learning_outcomes?: string;
  sales_count?: number;
  revenue?: number;
  completion_rate?: number;
  avg_rating?: number;
  total_reviews?: number;
  is_draft?: boolean;
  published_at?: string;
  video_id?: number;
  audio_id?: number;
  document_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author?: Profile;
  academy?: Academy;
  Academy?: Academy;
  /** @deprecated Use academy */
  store?: Academy;
  category?: Category;
  cover?: Media;
  seasons?: Season[];
  lessons?: Lesson[];
  students?: any[];
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  product_type: 'DIGITAL' | 'PHYSICAL';
  stock_quantity?: number | null;
  sku?: string;
  is_published: boolean;
  is_featured: boolean;
  author_id: number;
  academy_id: string;
  category_id?: number;
  sales_count: number;
  revenue: number;
  rating: number;
  rating_count: number;
  cover_id?: number;
  weight?: number | null;
  dimensions?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author?: Profile;
  academy?: Academy;
  category?: Category;
  cover?: Media;
  images?: Media[];
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export interface Order {
  id: number;
  order_number: string;
  profile_id: number;
  shipping_address_id?: number;
  total_amount: number;
  shipping_cost: number;
  currency: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  payment_id?: number;
  shipping_status?:
    | 'PENDING'
    | 'PREPARING'
    | 'SHIPPED'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'RETURNED';
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  profile?: Profile;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_type: 'COURSE' | 'PRODUCT';
  course_id?: number;
  product_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  course?: Course;
  product?: Product;
}

export interface ShippingAddress {
  id: number;
  profile_id: number;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
  lessons?: Lesson[];
}

export interface LiveSession {
  id: number;
  lesson_id: number;
  meeting_url: string | null;
  playback_url?: string | null;
  starts_at: string;
  ends_at?: string | null;
  duration_minutes?: number | null;
  timezone: string;
  recurrence_rule?: string | null;
  recurrence_until?: string | null;
  provider_label?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content?: string;
  duration?: number;
  order: number;
  course_id: string;
  season_id: string | null;
  video_id?: string;
  audio_id?: string;
  document_id?: string;
  image_id?: string;
  is_published: boolean;
  is_free: boolean;
  lesson_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'LIVE';
  allow_download_free?: boolean;
  allow_download_enrollment?: boolean;
  allow_download_subscription?: boolean;
  allow_download_tutoring?: boolean;
  created_at: string;
  updated_at: string;
  LiveSession?: LiveSession | null;
  season?: Season;
  // Backend Prisma relations come back capitalized; these are the real response shape.
  Video?: Video;
  Audio?: Audio;
  Document?: Document;
  Image?: Image;
  // Deprecated lowercase aliases — backend never returns these; kept only so older
  // read sites type-check. Prefer the capitalized relations above.
  video?: Video;
  audio?: Audio;
  document?: Document;
  image?: Image;
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

// Media Types
export type VideoHlsStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'SKIPPED';

export interface Video {
  id: number;
  publicUrl: string;
  title: string;
  duration?: number;
  hls_status?: VideoHlsStatus;
  created_at: string;
  updated_at: string;
}

export interface Audio {
  id: number;
  publicUrl: string;
  title: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  publicUrl: string;
  title: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  publicUrl: string;
  alt?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

// Category and Tag Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  type:
    | 'COURSE'
    | 'ARTICLE'
    | 'BLOG'
    | 'NEWS'
    | 'VIDEO'
    | 'AUDIO'
    | 'DOCUMENT'
    | 'IMAGE'
    | 'ROOT';
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  courses?: Course[];
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  courses?: CourseTag[];
}

export interface CourseTag {
  id: number;
  course_id: number;
  tag_id: number;
  created_at: string;
  course?: Course;
  tag?: Tag;
}

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
  status:
    | 'PENDING'
    | 'PAID'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';
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
  type?:
    | 'COURSE'
    | 'ARTICLE'
    | 'BLOG'
    | 'NEWS'
    | 'VIDEO'
    | 'AUDIO'
    | 'DOCUMENT'
    | 'IMAGE'
    | 'ROOT';
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

export interface CostCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFinancialRecord {
  id: number;
  academy_id: string;
  cost_category_id?: number;
  period_start: string;
  period_end: string;
  revenue: number;
  cost: number;
  profit: number;
  formula_adjustment: number;
  final_profit: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  costCategory?: CostCategory;
}

export interface PlatformFinancialRecord {
  id: number;
  cost_category_id?: number;
  period_start: string;
  period_end: string;
  revenue: number;
  cost: number;
  profit: number;
  formula_adjustment: number;
  final_profit: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  costCategory?: CostCategory;
}

export type FormulaType = 'REVENUE' | 'COST' | 'BENEFIT';
export type AdjustmentType = 'AUTOMATIC' | 'MANUAL' | 'GIFT' | 'INCENTIVE';
export type FormulaTemplate =
  | 'SIMPLE'
  | 'PERCENTAGE_OF'
  | 'FIXED_AMOUNT'
  | 'PERCENTAGE_BONUS'
  | 'CUSTOM';
export type FormulaOperation =
  | 'ADD'
  | 'SUBTRACT'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'PERCENTAGE'
  | 'FIXED';
export type FormulaVariable = 'REVENUE' | 'COST' | 'PROFIT' | 'FINAL_PROFIT';

export interface FormulaStep {
  operation: FormulaOperation;
  value?: number | string;
  variable?: FormulaVariable;
  percentage?: number;
}

export interface FinancialFormula {
  id: number;
  name: string;
  description?: string;
  formula: {
    steps: FormulaStep[];
    template?: FormulaTemplate;
  };
  template: FormulaTemplate;
  type: FormulaType;
  scope: FormulaScope;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormulaApplication {
  id: number;
  formula_id: number;
  academy_id?: string;
  period_start: string;
  period_end: string;
  adjustment_type: AdjustmentType;
  adjustment_amount?: number;
  adjustment_percent?: number;
  reason?: string;
  is_applied: boolean;
  applied_at?: string;
  applied_by?: number;
  created_at: string;
  updated_at: string;
  formula?: FinancialFormula;
  store?: {
    id: number;
    name: string;
    slug: string;
  };
  applier?: {
    id: number;
    display_name: string;
  };
}

export interface FinancialSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  record_count: number;
  currency: string;
  vat_rate?: number;
  platform_commission_rate?: number;
}

export interface PlatformFinancialSummary {
  platform: FinancialSummary;
  stores: FinancialSummary;
  total: FinancialSummary;
  vat_rate?: number;
  platform_commission_rate?: number;
}

export type OfferingType =
  | 'FREE'
  | 'ONE_TIME'
  | 'SUBSCRIPTION'
  | 'PRIVATE'
  | 'PAYMENT_PLAN';

export interface OfferCourseRef {
  Course: { id: string; title: string; slug: string };
}

export interface PaymentPlan {
  id: string;
  course_id: string;
  installment_count: number;
  amount_per_installment: number;
  interval_days: number;
  is_active: boolean;
}

export interface Offer {
  id: string;
  academy_id: string;
  type: OfferingType;
  title: string | null;
  slug: string | null;
  description: string | null;
  price: number;
  /** Price before discount, shown struck through. Null = no discount shown. */
  compare_at_price: number | null;
  currency: string;
  access_duration_days: number | null;
  /** False sells the recorded course only — the buyer never sees the live link. */
  includes_live: boolean;
  is_active: boolean;
  /** Set only on a PAYMENT_PLAN offer — the installment plan it charges through. */
  payment_plan_id: string | null;
  /** Set when this offer IS the course's own price — edit the course instead. */
  source_course_id: string | null;
  created_at: string;
  Courses: OfferCourseRef[];
}

export interface OfferInput {
  course_ids: string[];
  type: OfferingType;
  price?: number;
  compare_at_price?: number | null;
  title?: string;
  slug?: string;
  description?: string;
  access_duration_days?: number | null;
  includes_live?: boolean;
  is_active?: boolean;
  payment_plan_id?: string | null;
}
