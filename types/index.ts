import { Icons } from '@/components/icons';
import { IconType } from '@/components/icons';

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: IconType;
  label?: string;
  description?: string;
  children?: NavItem[];
  roles?: ('ADMIN' | 'MANAGER' | 'TEACHER')[]; // If not specified, all roles can access
  adminOnly?: boolean; // If true, only show to admins without stores (platform-level admins)
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

// Dashboard activity types
export interface ActivityItem {
  id: number;
  type:
    | 'course_created'
    | 'student_enrolled'
    | 'payment_received'
    | 'lesson_completed';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

// Stats card types
export interface StatsCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: keyof typeof Icons;
}

// Table column types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: unknown, record: T) => React.ReactNode;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: unknown;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Breadcrumb types
export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: keyof typeof Icons;
}

// Filter types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  title: string;
  key: string;
  options: FilterOption[];
  type: 'select' | 'checkbox' | 'radio' | 'date-range';
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search types
export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// File upload types
export interface FileUploadConfig {
  accept: string;
  maxSize: number; // in bytes
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Status badge types
export interface StatusConfig {
  [key: string]: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
}

// Action menu types
export interface ActionMenuItem {
  label: string;
  icon?: keyof typeof Icons;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

// Tab types
export interface TabItem {
  id: string;
  label: string;
  icon?: keyof typeof Icons;
  content: React.ReactNode;
  disabled?: boolean;
}

// Accordion types
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

// Tooltip types
export interface TooltipConfig {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: unknown;
}

// API response wrapper
export interface ApiResponseWrapper<T> {
  data: T;
  message?: string;
  status: number;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
