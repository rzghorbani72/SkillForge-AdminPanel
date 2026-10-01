import type { Academy, Media, Profile } from './part-1';

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
  certificate_rule?: 'FINAL_QUIZ' | 'ALL_QUIZZES';
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
  shipping_status?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';
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
  meeting_url_source?: 'MANUAL' | 'AUTO_JITSI';
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
export type VideoHlsStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'SKIPPED';

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
  type: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'IMAGE' | 'ROOT';
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
