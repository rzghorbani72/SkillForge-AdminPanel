/** Keys that must never hold session, tokens, or RBAC — wipe on every app load. */
const LEGACY_AUTH_KEYS = [
  'user_data',
  'current_profile',
  'current_academy',
  'current_store',
  'user_permissions',
  'auth_user',
  'auth_token',
  'jwt',
  'token',
  'user_state',
  'user-store',
] as const;

export function clearLegacyAuthStorage(): void {
  if (typeof window === 'undefined') return;
  for (const key of LEGACY_AUTH_KEYS) {
    window.localStorage.removeItem(key);
  }
}
