import {
  buildProductionCspConnectSrc,
  buildProductionCspFrameSrc,
  buildProductionCspImgSrc
} from './config';

export function buildContentSecurityPolicy(isDevelopment: boolean): string {
  if (isDevelopment) {
    return [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:",
      "style-src 'self' 'unsafe-inline' http://localhost:* https:",
      "img-src 'self' data: blob: http://localhost:* https:",
      "font-src 'self' data: http://localhost:* https:",
      "connect-src 'self' http://localhost:* ws://localhost:* ws: wss: https:",
      "media-src 'self' http://localhost:* https: blob: data:",
      "frame-src 'self' http://localhost:* https:",
      "frame-ancestors 'none'"
    ].join('; ');
  }

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${buildProductionCspImgSrc()}`,
    "font-src 'self' data:",
    `connect-src ${buildProductionCspConnectSrc()}`,
    "media-src 'self' https: blob: data:",
    `frame-src ${buildProductionCspFrameSrc()}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

export function buildSecurityHeaders(isDevelopment: boolean) {
  return [
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
    { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(isDevelopment)
    }
  ];
}
