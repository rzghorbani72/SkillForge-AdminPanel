import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Proxy API request to backend and handle redirects based on response status codes
 * - 401: Redirect to login
 * - 403: Redirect to dashboard
 */
export async function proxyApiRequest(
  request: NextRequest,
  backendPath: string,
  options: RequestInit = {}
): Promise<NextResponse> {
  try {
    const url = `${BACKEND_URL}${backendPath}`;

    // Forward cookies from the request
    const cookies = request.cookies.toString();

    // Forward headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookies && { Cookie: cookies }),
      ...options.headers
    };

    // Forward store ID header if present
    const storeId = request.headers.get('X-Store-ID');
    if (storeId) {
      headers['X-Store-ID'] = storeId;
    }

    // Forward CSRF token if present
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Make request to backend
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.body,
      ...options
    });

    // Handle 401 - Unauthorized: Redirect to login
    if (response.status === 401) {
      const loginUrl = new URL('/login', request.url);
      const currentPath = request.nextUrl.pathname + request.nextUrl.search;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register')
      ) {
        loginUrl.searchParams.set('redirect', currentPath);
      }

      // Return redirect response
      return NextResponse.redirect(loginUrl, { status: 302 });
    }

    // Handle 403 - Forbidden: Redirect to dashboard
    if (response.status === 403) {
      const dashboardUrl = new URL('/dashboard', request.url);

      // Return redirect response
      return NextResponse.redirect(dashboardUrl, { status: 302 });
    }

    // For other status codes, return the response as-is
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
