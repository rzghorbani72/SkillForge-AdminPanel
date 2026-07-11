import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';
import {
  enforceApiOriginCsrf,
  enforceApiRateLimit,
  enforceTrustedHost
} from '@/lib/security/request-guards';

const publicRoutes = [
  '/',
  '/login',
  '/admin-login',
  '/register',
  '/forget-password',
  '/admin-forget-password',
  '/find-school',
  '/select-school',
  '/unauthorized',
  '/support',
  '/terms',
  '/privacy',
  '/payment/callback'
] as const;

const authRoutes = [
  '/login',
  '/admin-login',
  '/register',
  '/forget-password',
  '/admin-forget-password'
] as const;

const ALLOWED_PANEL_ROLES = [
  'PLATFORM_OWNER',
  'ADMIN',
  'FINANCE',
  'SUPPORT',
  'MANAGER',
  'TEACHER'
] as const;

const SKIP_AUTH_PREFIXES = [
  '/api/',
  '/v1/',
  '/api',
  '/v1',
  '/_next/',
  '/favicon.ico',
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

function getUserRole(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const roles = payload.roles;
  if (Array.isArray(roles) && typeof roles[0] === 'string') return roles[0];
  if (typeof payload.role === 'string') return payload.role;
  return null;
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

  const userRole = getUserRole(decoded);
  const panelRoles = ALLOWED_PANEL_ROLES;

  if (
    userRole &&
    !panelRoles.includes(userRole as (typeof panelRoles)[number])
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized_role');
    loginUrl.searchParams.set(
      'message',
      'You do not have permission to access the admin dashboard.'
    );
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('jwt');
    return response;
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
