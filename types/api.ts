// User Status Type
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

// User and Authentication Types
export interface User {
  id: number;
  email?: string;
  display_name: string;
  phone_number: string;
  birthday?: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_active: boolean;
  status?: UserStatus;
  created_at: string;
  updated_at: string;
  profiles?: UserProfile[];
}

// User Profile (embedded in User response from /users endpoints)
export interface UserProfile {
  id: number;
  display_name: string;
  bio?: string;
  avatar_id?: number;
  is_active: boolean;
  store: {
    id: number;
    name: string;
    private_domain: string;
  };
  role: {
    id: number;
    name: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    description?: string;
  };
  avatar?: Media;
}

export interface Profile {
  id: number;
  user_id: number;
  store_id: number;
  role_id: number;
  display_name: string;
  bio?: string;
  avatar_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  store?: Store;
  role?: Role;
  avatar?: Media;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
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
}

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  is_default: boolean;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  domain_id: number;
  description?: string;
  logo_id?: number;
  cover_id?: number;
  is_active: boolean;
  country_code?: string;
  currency?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  primary_verification_method?: 'phone' | 'email';
  available_currencies?: CurrencyConfig[];
  default_currency?: CurrencyCode;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  domain?: Domain;
  logo?: Media;
  cover?: Media;
  profiles?: Profile[];
  courses?: Course[];
  categories?: Category[];
  themes?: Theme[];
  media?: Media[];
}

export interface Domain {
  id: number;
  private_address: string;
  public_address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stores?: Store[];
}

// Media Types
export interface Media {
  id: number;
  title: string;
  description?: string;
  filename: string;
  original_name: string;
  url: string;
  mime_type: string;
  size: number;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  metadata?: any;
  is_public: boolean;
  owner_id: number;
  store_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  owner?: User;
  store?: Store;
}

// Course and Learning Types
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  is_certificate?: boolean;
  cover_id?: number;
  author_id: number;
  store_id: number;
  category_id?: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  lessons_count: number;
  students_count: number;
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
  store?: Store;
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
  store_id: number;
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
  store?: Store;
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
  id: number;
  title: string;
  description?: string;
  course_id: number;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content?: string;
  duration?: number;
  order: number;
  season_id: number;
  video_id?: number;
  audio_id?: number;
  document_id?: number;
  image_id?: number;
  is_published: boolean;
  is_free: boolean;
  lesson_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ';
  created_at: string;
  updated_at: string;
  season?: Season;
  video?: Video;
  audio?: Audio;
  document?: Document;
  image?: Image;
}

// Media Types
export interface Video {
  id: number;
  url: string;
  title: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Audio {
  id: number;
  url: string;
  title: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  url: string;
  title: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: number;
  url: string;
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
  id: number;
  user_id: number;
  course_id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  enrolled_at: string;
  completed_at?: string;
  progress_percent?: number;
  user?: User;
  course?: Course;
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
  id: number;
  user_id: number;
  course_id: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
  transaction_id?: string;
  payment_date: string;
  refund_date?: string;
  user?: User;
  course?: Course;
  transactions?: Transaction[];
}

export interface Transaction {
  id: number;
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
  store_id: number;
  created_at: string;
  updated_at: string;
  store?: Store;
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
    | 'sidebar';
  order: number;
  isVisible: boolean;
  config?: Record<string, any>;
}

export interface UITemplate {
  id: number;
  store_id: number;
  blocks: UIBlockConfig[];
  template_preset?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: Store;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  preview?: string;
  blocks: UIBlockConfig[];
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
  store_id?: number;
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
  url: string;
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
  store_id: number;
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
  store_id?: number;
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
}

export interface PlatformFinancialSummary {
  platform: FinancialSummary;
  stores: FinancialSummary;
  total: FinancialSummary;
}
