import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Active, DataRef, Over } from '@dnd-kit/core';
import { ColumnDragData } from '@/sections/kanban/board-column';
import { TaskDragData } from '@/sections/kanban/task-card';
import { School } from '@/types/api';

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function isAuth(cookies: {
  get: (name: string) => { value?: string } | undefined;
}) {
  const token = cookies.get('jwt')?.value;
  return !!token;
}
export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    currency_symbol?: string;
    currency_position?: 'before' | 'after';
    divideBy?: number;
  }
): string {
  const {
    currency = 'USD',
    currency_symbol,
    currency_position = 'after',
    divideBy = 100
  } = options || {};

  const numericValue = amount / divideBy;

  // If custom symbol is provided, format manually
  if (currency_symbol) {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue);

    return currency_position === 'before'
      ? `${currency_symbol}${formattedNumber}`
      : `${formattedNumber} ${currency_symbol}`;
  }

  // Use Intl.NumberFormat for standard currencies
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(numericValue);
}

/**
 * Format currency using school's currency configuration
 * @param amount - Amount in smallest currency unit (e.g., cents, tomans)
 * @param school - School object with currency configuration
 * @param divideBy - Divisor to convert from smallest unit (default: 100 for cents, 1 for tomans)
 * @returns Formatted currency string
 */
export function formatCurrencyWithSchool(
  amount: number,
  school?: School | null,
  divideBy?: number
): string {
  if (!school) {
    // Fallback to USD if no school
    return formatCurrency(amount, { divideBy: divideBy || 100 });
  }

  // Check if school has currency configuration
  const hasCurrencyConfig = school.currency || school.currency_symbol;

  if (!hasCurrencyConfig) {
    // Fallback to default USD formatting if no currency config
    if (process.env.NODE_ENV === 'development') {
      console.warn('School missing currency config:', {
        schoolId: school.id,
        schoolName: school.name,
        hasCurrency: !!school.currency,
        hasCurrencySymbol: !!school.currency_symbol
      });
    }
    return formatCurrency(amount, { divideBy: divideBy || 100 });
  }

  // For Toman (IRR), typically no division needed as it's already in the base unit
  // For Turkish Lira (TRY/TL), also typically no division needed
  const defaultDivideBy =
    school.currency === 'IRR' ||
    school.currency === 'TRY' ||
    school.currency === 'TL'
      ? 1
      : 100;

  return formatCurrency(amount, {
    currency: school.currency || 'USD',
    currency_symbol: school.currency_symbol,
    currency_position: school.currency_position || 'after',
    divideBy: divideBy ?? defaultDivideBy
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const extension = getFileExtension(filename).toLowerCase();
  return videoExtensions.includes(extension);
}

export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
  const extension = getFileExtension(filename).toLowerCase();
  return audioExtensions.includes(extension);
}

export function isDocumentFile(filename: string): boolean {
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const extension = getFileExtension(filename).toLowerCase();
  return documentExtensions.includes(extension);
}
