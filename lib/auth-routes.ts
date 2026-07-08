const AUTH_PAGE_PREFIXES = [
  '/login',
  '/register',
  '/forget-password',
  '/admin-login',
  '/admin-forget-password'
] as const;

export function isAuthPagePath(path: string): boolean {
  return AUTH_PAGE_PREFIXES.some((prefix) => path.includes(prefix));
}
