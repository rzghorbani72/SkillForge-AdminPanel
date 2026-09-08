import { test, expect } from '@playwright/test';

/**
 * Smoke: the panel sets the baseline security headers (OWASP A05). AdminPanel
 * had NO Content-Security-Policy before — this guards that it stays set, plus
 * the clickjacking (X-Frame-Options: DENY) + sniffing headers. No backend.
 */
test.describe('AdminPanel security headers (smoke)', () => {
  test('login response sets CSP, frame, sniff and referrer headers', async ({
    page
  }) => {
    const res = await page.goto('/login');
    expect(res, 'navigation returned a response').toBeTruthy();
    const h = res!.headers();

    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['content-security-policy']).toContain('worker-src');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBeTruthy();
    expect(h['strict-transport-security']).toBeTruthy();
  });
});
