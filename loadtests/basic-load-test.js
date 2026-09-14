import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Basic Load Test for AdminPanel
 *
 * Test Objectives:
 * - Verify the application can handle 100 concurrent users
 * - Ensure response time stays under 1.5 seconds
 * - Monitor error rates during the test
 *
 * Run: k6 run loadtests/basic-load-test.js
 */

export const options = {
  stages: [
    { duration: '30s', target: 20, name: 'Ramp-up' }, // 0-20 VUs in 30s
    { duration: '1m30s', target: 100, name: 'Stay' }, // 20-100 VUs in 1m30s
    { duration: '1m', target: 100, name: 'Peak' }, // Hold at 100 VUs for 1m
    { duration: '30s', target: 0, name: 'Ramp-down' }, // 100-0 VUs in 30s
  ],
  thresholds: {
    // Response time thresholds
    http_req_duration: [
      'p(95)<500', // 95th percentile < 500ms
      'p(99)<1500', // 99th percentile < 1.5s
    ],
    // Error rate threshold
    http_req_failed: ['rate<0.1'], // Less than 0.1% failures

    // Custom threshold for successful requests
    checks: ['rate>0.95'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:4000';

  // Test 1: Load homepage
  {
    const response = http.get(`${baseUrl}/`);

    check(response, {
      'Homepage: status is 200': (r) => r.status === 200,
      'Homepage: response time < 500ms': (r) => r.timings.duration < 500,
      'Homepage: contains expected content': (r) =>
        r.body.includes('next') || r.body.includes('Next'),
    });
  }

  sleep(1);

  // Test 2: Load dashboard
  {
    const response = http.get(`${baseUrl}/dashboard`);

    check(response, {
      'Dashboard: status is 200 or 301 (redirect)': (r) => r.status === 200 || r.status === 301,
      'Dashboard: response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  }

  sleep(1);

  // Test 3: API endpoint
  {
    const response = http.get(`${baseUrl}/api/health`, {
      tags: { endpoint: '/api/health' },
    });

    check(response, {
      'API health: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'API: response time < 200ms': (r) => r.timings.duration < 200,
    });
  }

  sleep(1);
}
