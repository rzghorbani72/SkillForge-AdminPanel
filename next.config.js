const isDevelopment = process.env.NODE_ENV !== 'production';

const CACHE_CONTROL_APP = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=21600, must-revalidate';

const CACHE_CONTROL_API = isDevelopment
  ? 'no-store, no-cache, must-revalidate'
  : 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
  // CORS headers are handled by the backend API
  // Don't set Access-Control-Allow-Origin: * as it conflicts with credentials: true
  // and is a security risk for authenticated requests
];

const PRODUCTION_PUBLIC_DEFAULTS = {
  /** Same-origin path — cookies must be set on the panel host, not api-academy.darkube.ir */
  API_URL: '/api',
  BACKEND_API_URL: 'https://api-academy.darkube.ir/api',
  PANEL_HOST: 'https://panel-academy.darkube.ir'
};

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || PRODUCTION_PUBLIC_DEFAULTS.API_URL,
    NEXT_PUBLIC_HOST:
      process.env.NEXT_PUBLIC_HOST || PRODUCTION_PUBLIC_DEFAULTS.PANEL_HOST,
    NEXT_PUBLIC_BACKEND_API_URL:
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      PRODUCTION_PUBLIC_DEFAULTS.BACKEND_API_URL
  },
  async rewrites() {
    const backendTarget =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      PRODUCTION_PUBLIC_DEFAULTS.BACKEND_API_URL;
    const destination = backendTarget.replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${destination}/:path*`
      }
    ];
  },
  images: {
    // Use custom loader to bypass Next.js optimization and serve images directly from backend
    // This prevents server-side fetch errors (500) and avoids disk usage
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**'
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**'
      }
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  // webpack(config) {
  //   // Grab the existing rule that handles SVG imports
  //   const fileLoaderRule = config.module.rules.find((rule) =>
  //     rule.test?.test?.('.svg')
  //   );

  //   config.module.rules.push(
  //     // Reapply the existing rule, but only for svg imports ending in ?url
  //     {
  //       ...fileLoaderRule,
  //       test: /\.svg$/i,
  //       resourceQuery: /url/ // *.svg?url
  //     },
  //     // Convert all other *.svg imports to React components
  //     {
  //       test: /\.svg$/i,
  //       issuer: fileLoaderRule.issuer,
  //       resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
  //       use: ['@svgr/webpack']
  //     }
  //   );

  //   // Modify the file loader rule to ignore *.svg, since we have it handled now.
  //   fileLoaderRule.exclude = /\.svg$/i;

  //   return config;
  // },
  async headers() {
    return [
      {
        source: '/_next/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_APP
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_API
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          ...SECURITY_HEADERS,
          {
            key: 'Cache-Control',
            value: CACHE_CONTROL_APP
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
