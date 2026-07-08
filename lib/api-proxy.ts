import { NextRequest, NextResponse } from 'next/server';
import { buildTrustedBackendUrl } from './security/ssrf';
import { isAuthPagePath } from './auth-routes';

/**
 * Proxy API request to backend and handle redirects based on response status codes.
 */
export async function proxyApiRequest(
  request: NextRequest,
  backendPath: string,
  options: RequestInit = {}
): Promise<NextResponse> {
  try {
    const url = buildTrustedBackendUrl(backendPath);

    const cookies = request.cookies.toString();

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (cookies) {
      headers.set('Cookie', cookies);
    }
    const merged = options.headers;
    if (merged) {
      if (merged instanceof Headers) {
        merged.forEach((value, key) => headers.set(key, value));
      } else if (Array.isArray(merged)) {
        merged.forEach(([key, value]) => headers.set(key, value));
      } else {
        Object.entries(merged).forEach(([key, value]) => {
          if (value !== undefined) headers.set(key, String(value));
        });
      }
    }

    const academyId = request.headers.get('X-Academy-ID');
    if (academyId) {
      headers.set('X-Academy-ID', academyId);
    }

    const csrfToken = request.headers.get('X-CSRF-Token');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.body,
      ...options
    });

    if (response.status === 401) {
      const currentPath = request.nextUrl.pathname + request.nextUrl.search;
      if (!isAuthPagePath(currentPath)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', currentPath);
        return NextResponse.redirect(loginUrl, { status: 302 });
      }
    }

    if (response.status === 403) {
      const currentPath = request.nextUrl.pathname;
      if (!currentPath.includes('/dashboard') && !isAuthPagePath(currentPath)) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl, { status: 302 });
      }
    }

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}
