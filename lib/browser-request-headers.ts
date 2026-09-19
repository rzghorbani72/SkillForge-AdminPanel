// Cookie-auth needs two headers the browser cannot add by itself: the
// double-submit CSRF token and the selected academy id. Every fetch helper
// must build them from here, otherwise one module drifts and its writes 403.

const SELECTED_ACADEMY_STORAGE_KEY = 'selected_academy_id';

const SAFE_METHODS = ['GET', 'HEAD'];

export function readCsrfTokenFromDocument(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf-token='))
    ?.split('=')[1];
}

export function csrfHeader(
  method: string = 'GET',
  tokenOverride?: string | null,
): Record<string, string> {
  if (typeof document === 'undefined') return {};
  if (SAFE_METHODS.includes(method.toUpperCase())) return {};

  const csrfToken = tokenOverride || readCsrfTokenFromDocument();

  return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
}

export function selectedAcademyHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const academyId = window.localStorage.getItem(SELECTED_ACADEMY_STORAGE_KEY);
  // Platform mode (admin with no academy selected) clears the id, so an absent
  // selection means "do not scope this request to an academy".
  const hasSelectedAcademy = !!academyId && academyId !== 'null' && academyId !== '';

  return hasSelectedAcademy ? { 'X-Academy-ID': academyId } : {};
}

export function browserRequestHeaders(
  method: string = 'GET',
  csrfToken?: string | null,
): Record<string, string> {
  return { ...csrfHeader(method, csrfToken), ...selectedAcademyHeader() };
}
