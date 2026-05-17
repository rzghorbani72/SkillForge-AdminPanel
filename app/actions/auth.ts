'use server';

import { cookies } from 'next/headers';

import { getServerApiBaseUrl } from '@/lib/api-base-url';

const API_BASE_URL = getServerApiBaseUrl();

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store'
        });
      } catch (error) {
        // Continue with cookie deletion even if backend call fails
        console.warn('Backend logout call failed:', error);
      }
    }

    // Delete the JWT cookie from the request
    cookieStore.delete('jwt');

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
}
