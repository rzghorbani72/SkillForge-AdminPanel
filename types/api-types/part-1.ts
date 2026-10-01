import type { Category, Course } from './part-2';
import type { Theme } from './part-3';

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

export type PlatformStaffRoleName = 'PLATFORM_OWNER' | 'ADMIN' | 'FINANCE' | 'SUPPORT';

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
  /** Money moved here, so the academy cannot be deleted. */
  has_transactions?: boolean;
  /** This caller may delete the academy if it has no transactions. */
  can_remove?: boolean;
  country_code?: string;
  currency?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  subscription_plan?: string;
  subscription_expires?: string;
  /** Creating manager (academy owner). Null when the person has no stored name. */
  manager_name?: string | null;
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
  Domain?: Pick<Domain, 'private_address' | 'public_address' | 'id'> & Partial<Domain>;
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
