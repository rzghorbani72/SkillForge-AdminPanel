// User and Authentication Types
export interface User {
  id: number;
  email?: string;
  name: string;
  phone_number: string;
  birthday?: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  school_id: number;
  role_id: number;
  display_name: string;
  bio?: string;
  avatar_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  school?: School;
  role?: Role;
  avatar?: Media;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'USER';
  description?: string;
  created_at: string;
  updated_at: string;
}

// School and Domain Types
export interface School {
  id: number;
  name: string;
  slug: string;
  domain_id: number;
  description?: string;
  logo_id?: number;
  cover_id?: number;
  is_active: boolean;
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
  schools?: School[];
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
  school_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  owner?: User;
  school?: School;
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
  is_free: boolean;
  is_published: boolean;
  is_featured: boolean;
  cover_id?: number;
  author_id: number;
  school_id: number;
  category_id?: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  lessons_count: number;
  students_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  author?: Profile;
  school?: School;
  category?: Category;
  cover?: Media;
  seasons?: Season[];
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
  course_id: number;
  season_id?: number;
  media_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
  season?: Season;
  media?: Media;
}

// Category and Tag Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  type: 'COURSE' | 'LESSON';
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
  school_id: number;
  created_at: string;
  updated_at: string;
  school?: School;
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
export interface CreateSchoolData {
  name: string;
  private_domain: string;
  description?: string;
}

export interface UpdateSchoolData {
  name?: string;
  private_domain?: string;
  description?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  is_free: boolean;
  category_id?: number;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
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
  type?: 'COURSE' | 'LESSON';
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
  school_id?: number;
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