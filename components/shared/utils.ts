// Common utility functions for role and status handling

import { DEFAULT_LANGUAGE, getLocaleForLanguage } from '@/lib/i18n/config';

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '👑';
    case 'MANAGER':
      return '🛡️';
    case 'TEACHER':
      return '🎓';
    case 'STUDENT':
      return '👤';
    default:
      return '👤';
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800';
    case 'MANAGER':
      return 'bg-blue-100 text-blue-800';
    case 'TEACHER':
      return 'bg-green-100 text-green-800';
    case 'STUDENT':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800';
    case 'BANNED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const localeDigits = (value: number, minimumIntegerDigits = 1) =>
  new Intl.NumberFormat(getLocaleForLanguage(DEFAULT_LANGUAGE), {
    minimumIntegerDigits,
    maximumFractionDigits: 1,
    useGrouping: false
  }).format(value);

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Returns an empty string when unknown, so callers can simply hide the field. */
export const formatFileSize = (bytes?: number | null) => {
  if (bytes == null || bytes <= 0) return '';
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${localeDigits(Number(value.toFixed(exponent === 0 ? 0 : 1)))} ${SIZE_UNITS[exponent]}`;
};

/** `mm:ss`, or `h:mm` once past an hour. Empty when the duration is unknown. */
export const formatDuration = (seconds?: number | null) => {
  if (seconds == null || Number.isNaN(seconds) || seconds < 0) return '';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${localeDigits(hours)}:${localeDigits(minutes, 2)}`;
  }
  return `${localeDigits(minutes)}:${localeDigits(totalSeconds % 60, 2)}`;
};
