import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

/**
 * Middleware for handling page route authentication and redirects
 *
 * Note: This middleware handles page routes only (API routes are excluded).
 * For API route redirects based on backend response status codes:
 * - Use the proxyApiRequest utility in lib/api-proxy.ts for API routes
 * - The API client in lib/api.ts already handles 401/403 redirects for client-side API calls
 *
 * Redirect behavior:
 * - 401 (Unauthorized): Redirects to /login
 * - 403 (Forbidden): Redirects to /dashboard
 */

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/find-store',
  '/select-store',
  '/unauthorized',
  '/support',
  '/terms',
  '/privacy'
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

// Allowed roles for admin dashboard
const ALLOWED_ADMIN_ROLES = ['ADMIN', 'MANAGER', 'TEACHER'];

/**
 * Verify JWT token signature and decode payload
 * Uses jose library for secure JWT verification in Edge runtime
 */
async function verifyJWT(
  token: string
): Promise<{ valid: boolean; payload: any }> {
  try {
    const secret = process.env.JWT_SECRET;

    // In development or if no secret, fall back to decode-only (with warning)
    if (!secret) {
      console.warn(
        '⚠️ JWT_SECRET not set - JWT signature verification disabled. Set JWT_SECRET in production!'
      );
      const payload = decodeJwt(token);
      // At minimum, check expiration
      const isExpired =
        payload.exp &&
        typeof payload.exp === 'number' &&
        payload.exp < Date.now() / 1000;
      if (isExpired) {
        return { valid: false, payload: null };
      }
      return { valid: true, payload };
    }

    // Verify the token signature using the secret
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    });

    return { valid: true, payload };
  } catch (error) {
    // Token verification failed (invalid signature, expired, malformed)
    return { valid: false, payload: null };
  }
}

/**
 * Create a response with redirect headers for client-side handling
 * This is used when backend API returns 401/403 and we want to redirect
 */
function createRedirectResponse(
  request: NextRequest,
  statusCode: 401 | 403
): NextResponse {
  const redirectUrl =
    statusCode === 401
      ? new URL('/login', request.url)
      : new URL('/dashboard', request.url);

  // Add current path as redirect parameter for 401
  if (statusCode === 401) {
    const currentPath = request.nextUrl.pathname + request.nextUrl.search;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      redirectUrl.searchParams.set('redirect', currentPath);
    }
  }

  const response = NextResponse.next();
  // Add custom headers to signal the client to redirect
  response.headers.set('X-Redirect-Status', statusCode.toString());
  response.headers.set('X-Redirect-URL', redirectUrl.toString());

  return response;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // Get the token from cookies and verify it
  const token = request.cookies.get('jwt')?.value || '';
  let isAuthenticated = false;
  let decoded: any = null;

  if (token) {
    const { valid, payload } = await verifyJWT(token);
    isAuthenticated = valid;
    decoded = payload;
  }
  const userRole = decoded?.roles?.[0] || decoded?.role || null;

  console.log('userRole', userRole);

  // If user has USER or STUDENT role, redirect to login with error
  if (userRole && !ALLOWED_ADMIN_ROLES.includes(userRole)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized_role');
    loginUrl.searchParams.set(
      'message',
      'You do not have permission to access the admin dashboard. Only ADMIN, MANAGER, and TEACHER roles are allowed.'
    );
    // Clear the JWT cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('jwt');
    return response;
  }

  // If user is authenticated, check their role
  if (isAuthenticated && !isPublicRoute) {
    try {
      // If user is on an auth route and has valid admin role, redirect to dashboard
      if (isAuthRoute && userRole && ALLOWED_ADMIN_ROLES.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // If user is authenticated with valid role but trying to access root path
      if (
        pathname === '/' &&
        userRole &&
        ALLOWED_ADMIN_ROLES.includes(userRole)
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('jwt');
      return response;
    }
  }

  // If user is on an auth route and is already authenticated (fallback)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login with the original URL as a parameter
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access the root path
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Create response and add headers for API response handling
  const response = NextResponse.next();

  // Add headers that can be checked by client-side code
  // These will be used by the API client to handle redirects
  if (typeof window === 'undefined') {
    // Server-side: Add headers for potential redirect handling
    response.headers.set(
      'X-Auth-Status',
      isAuthenticated ? 'authenticated' : 'unauthenticated'
    );
    if (userRole) {
      response.headers.set('X-User-Role', userRole);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)'
  ]
};
