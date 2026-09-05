import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';
import {
  enforceApiOriginCsrf,
  enforceApiRateLimit,
  enforceTrustedHost
} from '@/lib/security/request-guards';
import {
  canOpenRoute,
  checkoutQueryFromSearch,
  homeRouteFor,
  resolveSessionRole
} from '@/lib/auth-routing';

const publicRoutes = [
  '/',
  '/login',
  '/admin-login',
  '/register',
  '/forget-password',
  '/admin-forget-password',
  '/select-school',
  '/unauthorized',
  '/support',
  '/terms',
  '/privacy',
  '/payment/callback',
  '/auth/handoff'
] as const;

const authRoutes = [
  '/login',
  '/admin-login',
  '/register',
  '/forget-password',
  '/admin-forget-password'
] as const;

const SKIP_AUTH_PREFIXES = [
  '/api/',
  '/v1/',
  '/api',
  '/v1',
  '/_next/',
  '/favicon.ico',
  '/payment/bitpay-callback',
  '/payment/saman-callback',
  '/payment/mellat-callback'
] as const;

async function verifyJWT(
  token: string
): Promise<{ valid: boolean; payload: Record<string, unknown> | null }> {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      const payload = decodeJwt(token);
      const isExpired =
        payload.exp &&
        typeof payload.exp === 'number' &&
        payload.exp < Date.now() / 1000;
      if (isExpired) return { valid: false, payload: null };
      return { valid: true, payload };
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    });
    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
}

function shouldSkipPageAuth(pathname: string): boolean {
  if (
    SKIP_AUTH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix)
    )
  ) {
    return true;
  }
  // /fa/v1/... or /en/v1/... API rewrites
  return /^\/[a-z]{2,5}\/v1(\/|$)/i.test(pathname);
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

async function handlePageAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('jwt')?.value ?? '';
  let isAuthenticated = false;
  let decoded: Record<string, unknown> | null = null;

  if (token) {
    const result = await verifyJWT(token);
    isAuthenticated = result.valid;
    decoded = result.payload;
  }

  // The JWT payload carries `roles: [name]`, the same shape the login response
  // uses — so both sides resolve the role through one helper.
  const userRole = resolveSessionRole(decoded);
  // Where this session belongs. Login uses the same helper, so the two can never
  // send the user to a route the other one bounces.
  const checkoutQuery = checkoutQueryFromSearch(
    request.nextUrl.searchParams.get('plan'),
    request.nextUrl.searchParams.get('period')
  );
  const home = isAuthenticated
    ? homeRouteFor(userRole, { planQuery: checkoutQuery })
    : null;

  const redirectHome = (): NextResponse => {
    // Never redirect onto the current path — that is an infinite loop.
    if (!home || home === pathname) return NextResponse.next();
    return NextResponse.redirect(new URL(home, request.url));
  };

  // A session with no panel role is not staff. Deny it; /unauthorized is only
  // for banned or deactivated panel accounts.
  if (isAuthenticated && home === null) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('jwt');
    response.cookies.delete('refresh_token');
    return response;
  }

  if (isAuthenticated && (isAuthRoute(pathname) || pathname === '/')) {
    return redirectHome();
  }

  // A role opening a page it has no business on is sent to its own home — the
  // session cookie is never destroyed for merely visiting the wrong URL.
  if (
    isAuthenticated &&
    !isPublicRoute(pathname) &&
    !canOpenRoute(userRole, pathname)
  ) {
    return redirectHome();
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set(
    'X-Auth-Status',
    isAuthenticated ? 'authenticated' : 'unauthenticated'
  );
  if (userRole) response.headers.set('X-User-Role', userRole);
  return response;
}

export async function middleware(request: NextRequest) {
  const blocked =
    enforceTrustedHost(request) ??
    enforceApiRateLimit(request) ??
    enforceApiOriginCsrf(request);

  if (blocked) return blocked;

  if (shouldSkipPageAuth(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return handlePageAuth(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf)$).*)'
  ]
};
