/**
 * Development utilities for localhost compatibility
 */

import { ACADEMY_DOMAIN } from './slug';

/**
 * Check if the application is running in development mode
 */
export function isDevelopmentMode(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  );
}

/**
 * Get the appropriate base URL for the current environment
 */
export function getBaseUrl(): string {
  if (isDevelopmentMode()) {
    return 'http://localhost:3000';
  }
  return `https://${ACADEMY_DOMAIN}`;
}

/**
 * Get store URL for development or production
 */
export function getStoreUrl(storeSlug: string): string {
  if (isDevelopmentMode()) {
    return `http://${storeSlug}.localhost:3000`;
  }
  return `https://${storeSlug}.${ACADEMY_DOMAIN}`;
}

/**
 * Get admin panel URL for development or production
 */
export function getAdminPanelUrl(): string {
  if (isDevelopmentMode()) {
    return 'http://localhost:3000';
  }
  return `https://admin.${ACADEMY_DOMAIN}`;
}

/**
 * Log development information
 */
export function logDevInfo(message: string, data?: any): void {
  if (isDevelopmentMode()) {
    console.log(`[DEV] ${message}`, data || '');
  }
}

/**
 * Show development mode notification
 */
export function showDevNotification(message: string): void {
  if (isDevelopmentMode()) {
    console.log(`[DEV NOTIFICATION] ${message}`);
    // You can also show a toast notification here if needed
  }
}
