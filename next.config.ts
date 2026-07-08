import type { NextConfig } from 'next';
import {
  API_PRODUCTION_DEFAULTS,
  API_REWRITE_SOURCES,
  API_VERSION_PATH,
  resolveBackendRewriteTarget
} from './lib/api-config';

const isDevelopment = process.env.NODE_ENV !== 'production';

const CACHE_CONTROL_APP = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=21600, must-revalidate';

const CACHE_CONTROL_API = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

const CSP = isDevelopment
  ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:; style-src 'self' 'unsafe-inline' http://localhost:* https:; img-src 'self' data: blob: http://localhost:* https:; font-src 'self' data: http://localhost:* https:; connect-src 'self' http://localhost:* ws://localhost:* wss: https:; media-src 'self' http://localhost:* https: blob: data:; frame-ancestors 'none';"
  : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' https: blob: data:; frame-ancestors 'none';";

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: CSP }
];

const nextConfig: NextConfig = {
  output: 'standalone',
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
    const destination = resolveBackendRewriteTarget(
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL
    );
    return [
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
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: `${API_VERSION_PATH}/images/**`
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: `${API_VERSION_PATH}/images/**`
      }
    ],
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
        source: API_REWRITE_SOURCES.legacy,
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
