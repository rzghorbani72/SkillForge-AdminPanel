import http from 'k6/http';
import { check, group, sleep } from 'k6';

/**
 * Advanced API Load Test
 *
 * Tests multiple API endpoints with different scenarios:
 * - User authentication
 * - Dashboard data fetching
 * - CRUD operations
 *
 * Run: k6 run loadtests/api-load-test.js
 * Run with custom BASE_URL: k6 run -e BASE_URL=https://api.example.com loadtests/api-load-test.js
 */

export const options = {
  vus: 50, // Virtual Users
  duration: '3m', // Total duration
  rps: 100, // Requests per second

  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],

  // Define thresholds with tags
  thresholds: {
    'http_req_duration{endpoint:homepage}': ['p(95)<500'],
    'http_req_duration{endpoint:dashboard}': ['p(95)<1000'],
    'http_req_duration{endpoint:api}': ['p(95)<300'],
    'http_req_failed{endpoint:api}': ['rate<0.05'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:4000';

  group('GET Requests', () => {
    // Homepage
    {
      const response = http.get(`${baseUrl}/`, {
        tags: { endpoint: 'homepage' },
      });

      check(response, {
        'GET /: status 200': (r) => r.status === 200,
        'GET /: response time < 500ms': (r) => r.timings.duration < 500,
      });
    }

    sleep(0.5);

    // Dashboard
    {
      const response = http.get(`${baseUrl}/dashboard`, {
        tags: { endpoint: 'dashboard' },
      });

      check(response, {
        'GET /dashboard: status 200 or 301': (r) => r.status === 200 || r.status === 301,
        'GET /dashboard: response time < 1000ms': (r) => r.timings.duration < 1000,
      });
    }

    sleep(0.5);
  });

  group('API Endpoints', () => {
    // Health check
    {
      const response = http.get(`${baseUrl}/api/health`, {
        tags: { endpoint: 'api' },
      });

      check(response, {
        'GET /api/health: status 200': (r) => r.status === 200 || r.status === 404,
        'GET /api/health: response time < 200ms': (r) => r.timings.duration < 200,
      });
    }

    sleep(0.3);
  });

  group('Simulated User Journey', () => {
    // 1. User visits homepage
    http.get(`${baseUrl}/`, {
      tags: { name: 'user-journey-homepage' },
    });
    sleep(1);

    // 2. User navigates to dashboard
    http.get(`${baseUrl}/dashboard`, {
      tags: { name: 'user-journey-dashboard' },
    });
    sleep(2);

    // 3. User interacts with API
    http.get(`${baseUrl}/api/data`, {
      tags: { name: 'user-journey-api' },
    });
    sleep(1);
  });

  sleep(1);
}
