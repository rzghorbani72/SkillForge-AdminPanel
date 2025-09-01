/**
 * Development utilities for localhost compatibility
 */

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
  return 'https://skillforge.com';
}

/**
 * Get school URL for development or production
 */
export function getSchoolUrl(schoolSlug: string): string {
  if (isDevelopmentMode()) {
    return `http://${schoolSlug}.localhost:3000`;
  }
  return `https://${schoolSlug}.skillforge.com`;
}

/**
 * Get admin panel URL for development or production
 */
export function getAdminPanelUrl(): string {
  if (isDevelopmentMode()) {
    return 'http://localhost:3000';
  }
  return 'https://admin.skillforge.com';
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
