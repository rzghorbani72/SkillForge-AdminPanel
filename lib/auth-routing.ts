import { isPlatformStaff } from './roles';

/**
 * One source of truth for "what role is this session" and "where may that role go".
 *
 * The login hooks and `middleware.ts` both import this. When they each kept their
 * own answer they disagreed, and the login page sent users to routes the middleware
 * then bounced — which is how a successful login ended back on /login.
 *
 * Must stay dependency-free: middleware runs in the edge runtime (no window, no Node APIs).
 */

/**
 * Every role may use the panel except these. Academies invent their own roles, so
 * an allowlist would lock out each new one — the rule is stated as "student rank
 * and below cannot sign in", and everything else is staff.
 */
const NON_PANEL_ROLES = ['STUDENT', 'USER'] as const;

/** Affiliates are external referrers: they sign in, but only to their own area. */
const AFFILIATE_ROUTES = ['/my-affiliate', '/user', '/settings'] as const;

/** Banned or deactivated staff land here. Not a fallback for missing panel roles. */
export const NO_HOME_ROUTE = '/unauthorized';

/**
 * Academy-defined roles are stored under a generated name — `TEACHER_1`,
 * `MANAGER_2` — and rank, not name, is the authorization signal (see the
 * Backend's `auth/role-access.ts`). Comparing the raw name against `'TEACHER'`
 * therefore misses every custom role, which is what left those users stranded
 * on the login screen. Strip the generated suffix back to its base role.
 */
export function normalizeRoleName(name: string): string {
  return name.replace(/_\d+$/, '');
}

type SessionShape = {
  roles?: unknown;
  role?: unknown;
  currentProfile?: {
    Role?: { name?: unknown };
    role?: { name?: unknown } | unknown;
  } | null;
};

/**
 * The authoritative role of a login response or JWT payload.
 *
 * `roles[0]` is what the backend put into the JWT, so it is the only value that can
 * agree with the middleware. `currentProfile.Role.name` is a fallback because platform
 * staff sessions carry an AdminProfile, which has no Role relation at all.
 */
export function resolveSessionRole(session: unknown): string | null {
  if (!session || typeof session !== 'object') return null;
  const { roles, role, currentProfile } = session as SessionShape;

  const nested = currentProfile?.role;
  const nestedName =
    nested && typeof nested === 'object'
      ? (nested as { name?: unknown }).name
      : nested;

  const candidates = [
    Array.isArray(roles) ? roles[0] : null,
    role,
    currentProfile?.Role?.name,
    nestedName
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return normalizeRoleName(candidate.trim());
    }
  }

  return null;
}

function isPanelRole(role: string | null): role is string {
  return !!role && !(NON_PANEL_ROLES as readonly string[]).includes(role);
}

export function canOpenRoute(role: string | null, pathname: string): boolean {
  if (!isPanelRole(role)) return false;
  if (role !== 'AFFILIATE') return true;

  return AFFILIATE_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export interface HomeRouteOptions {
  /** Already-encoded query such as `?plan=growth`, set when buying a plan. */
  planQuery?: string;
}

const PLAN_SLUG = /^[a-z0-9-]{1,32}$/;

/**
 * Landing "pay this plan" links land on /login?plan=growth&period=quarterly.
 * Only a real plan slug is forwarded — anything else is dropped so a crafted
 * URL cannot bounce the manager onto an unexpected path after sign-in.
 */
export function checkoutQueryFromSearch(
  plan: string | null | undefined,
  period: string | null | undefined
): string {
  const slug = (plan ?? '').trim().toLowerCase();
  if (!PLAN_SLUG.test(slug)) return '';
  const periodPart =
    period === 'monthly' || period === 'quarterly' ? `&period=${period}` : '';
  return `?plan=${encodeURIComponent(slug)}${periodPart}`;
}

/**
 * A `?next=` / `?redirect=` value is attacker-controllable. Only same-origin
 * relative panel paths are safe after a session is opened.
 */
export function safePanelPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) return fallback;
  const candidate = value.trim();
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//')) return fallback;
  if (candidate.includes('\\')) return fallback;
  if (
    /^\/(?:login|register|admin-login|forget-password|admin-forget-password|auth\/handoff)\b/.test(
      candidate
    )
  ) {
    return fallback;
  }
  return candidate;
}

/**
 * Where this role belongs after login. `null` means it has no home in this panel.
 *
 * Academy-less managers land on the dashboard like everyone else — whether they
 * are invited to create an academy is decided there, not by the login redirect.
 */
export function homeRouteFor(
  role: string | null,
  options: HomeRouteOptions = {}
): string | null {
  if (!isPanelRole(role)) return null;

  const { planQuery = '' } = options;

  if (isPlatformStaff({ role })) return '/platform';
  if (role === 'AFFILIATE') return '/my-affiliate';

  return planQuery ? `/plans${planQuery}` : '/dashboard';
}
