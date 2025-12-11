'use client';

/**
 * Re-export useAuthUser from UserProvider for backward compatibility
 * This hook now uses the UserProvider context instead of making its own API call
 */
export { useAuthUser } from '@/components/providers/user-provider';
