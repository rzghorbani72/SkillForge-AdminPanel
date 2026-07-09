import type { NextConfig } from 'next';
import {
  API_PRODUCTION_DEFAULTS,
  API_REWRITE_SOURCES,
  API_VERSION_PATH
} from './lib/api-config';
import { getAllowedImageRemotePatterns } from './lib/security/config';
import { buildSecurityHeaders } from './lib/security/headers';
import { getServerActionAllowedOrigins } from './lib/security/config';
import { assertAllowedBackendRewriteTarget } from './lib/security/ssrf';

const isDevelopment = process.env.NODE_ENV !== 'production';

const CACHE_CONTROL_APP = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=21600, must-revalidate';

const CACHE_CONTROL_API = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

const SECURITY_HEADERS = buildSecurityHeaders(isDevelopment);

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
      bodySizeLimit: '1mb'
    }
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || API_PRODUCTION_DEFAULTS.browserApiUrl,
    NEXT_PUBLIC_HOST:
      process.env.NEXT_PUBLIC_HOST || API_PRODUCTION_DEFAULTS.panelHost,
    NEXT_PUBLIC_BACKEND_API_URL:
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      API_PRODUCTION_DEFAULTS.backendApiUrl
  },
  async rewrites() {
    const rawTarget =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const destination = assertAllowedBackendRewriteTarget(
      rawTarget || API_PRODUCTION_DEFAULTS.backendApiUrl
    );

    return [
      {
        source: API_REWRITE_SOURCES.langPrefixed,
        destination: `${destination.replace(/\/v1\/?$/, '')}/:lang/v1/:path*`
      },
      {
        source: API_REWRITE_SOURCES.current,
        destination: `${destination}/:path*`
      },
      {
        source: API_REWRITE_SOURCES.legacy,
        destination: `${destination}/:path*`
      }
    ];
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    remotePatterns: getAllowedImageRemotePatterns(),
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  async headers() {
    return [
      {
        source: '/_next/:slug*',
        headers: [{ key: 'Cache-Control', value: CACHE_CONTROL_APP }]
      },
      {
        source: API_REWRITE_SOURCES.langPrefixed,
        headers: [{ key: 'Cache-Control', value: CACHE_CONTROL_API }]
      },
      {
        source: API_REWRITE_SOURCES.legacy,
        headers: [{ key: 'Cache-Control', value: CACHE_CONTROL_API }]
      },
      {
        source: API_REWRITE_SOURCES.current,
        headers: [{ key: 'Cache-Control', value: CACHE_CONTROL_API }]
      },
      {
        source: '/(.*)',
        headers: [
          ...SECURITY_HEADERS,
          { key: 'Cache-Control', value: CACHE_CONTROL_APP }
        ]
      }
    ];
  }
};

export default nextConfig;
