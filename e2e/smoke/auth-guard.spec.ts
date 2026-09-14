import { test, expect } from '@playwright/test';

/**
 * Hacker / unauthenticated-access smoke (no backend): hitting any protected
 * route directly by URL must bounce to /login — never render the panel or leak
 * a shell. Covers manager, financial and platform-only (ADMIN) surfaces.
 */
const PROTECTED = [
  '/dashboard',
  '/users',
  '/platform/users',
  '/courses',
  '/financial/platform',
  '/platform/academies',
  '/platform/costs',
  '/support-access-logs',
  '/settings',
];

test.describe('AdminPanel auth guard (smoke)', () => {
  for (const route of PROTECTED) {
    test(`unauthenticated ${route} → redirected to /login`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
  }
});
