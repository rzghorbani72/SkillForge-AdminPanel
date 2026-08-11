import { test, expect, Page } from '@playwright/test';

/**
 * Role-matrix + hacker journeys (@backend). Each role logs in through the real
 * UI against a seeded API and we assert the surface it may / may-not reach. The
 * BACKEND already proves RBAC at the API (Backend `test:e2e:rbac`); these prove
 * the PANEL UI guard layer agrees, and that a lower role cannot reach an
 * ADMIN-only screen by typing the URL (privilege-escalation hacker path).
 *
 * Run (see e2e/README.md):
 *   E2E_BACKEND=1 \
 *   E2E_MANAGER_PHONE=09... E2E_MANAGER_PASSWORD=... \
 *   E2E_TEACHER_PHONE=09... E2E_TEACHER_PASSWORD=... \
 *   E2E_ADMIN_EMAIL=...     E2E_ADMIN_PASSWORD=... \
 *   pnpm test:e2e e2e/roles
 */
test.describe('AdminPanel role journeys @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  const submit = (page: Page) =>
    page.locator('form button:not([type="button"])').last();

  async function staffLogin(page: Page, phone: string, password: string) {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(phone);
    await page.locator('input[type="password"]').pressSequentially(password);
    await submit(page).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  }

  async function adminLogin(page: Page, email: string, password: string) {
    await page.goto('/admin-login');
    // admin-login takes an email identifier + password (ADMIN/SUPPORT entry).
    await page
      .locator('input[type="email"], input[type="text"]')
      .first()
      .fill(email);
    await page.locator('input[type="password"]').pressSequentially(password);
    await submit(page).click();
    await expect(page).not.toHaveURL(/\/admin-login/, { timeout: 15_000 });
  }

  test('MANAGER reaches the dashboard + student management', async ({
    page
  }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    const password = process.env.E2E_MANAGER_PASSWORD;
    test.skip(!phone || !password, 'E2E_MANAGER_PHONE/PASSWORD required');

    await staffLogin(page, phone!, password!);
    await page.goto('/users?role=STUDENT');
    await expect(page).toHaveURL(/\/users/);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    await expect(page.locator('a[href="/assignments"]').first()).toBeVisible();
    await expect(page.locator('a[href="/analytics"]').first()).toBeVisible();
  });

  test('HACKER — MANAGER cannot open ADMIN-only platform screens by URL', async ({
    page
  }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    const password = process.env.E2E_MANAGER_PASSWORD;
    test.skip(!phone || !password, 'E2E_MANAGER_PHONE/PASSWORD required');

    await staffLogin(page, phone!, password!);
    for (const adminOnly of [
      '/platform/academies',
      '/platform-settings',
      '/financial/platform'
    ]) {
      await page.goto(adminOnly, { waitUntil: 'domcontentloaded' });
      // The panel must bounce a non-admin off an admin route (to /unauthorized or
      // away from the route) — never render the platform screen.
      await expect(page).not.toHaveURL(
        new RegExp(adminOnly.replace(/\//g, '\\/')),
        {
          timeout: 10_000
        }
      );
    }
  });

  test('TEACHER lands in the panel but not on manager-only user management', async ({
    page
  }) => {
    const phone = process.env.E2E_TEACHER_PHONE;
    const password = process.env.E2E_TEACHER_PASSWORD;
    test.skip(!phone || !password, 'E2E_TEACHER_PHONE/PASSWORD required');

    await staffLogin(page, phone!, password!);
    await expect(page.locator('a[href="/assignments"]').first()).toBeVisible();
    await expect(page.locator('a[href="/analytics"]')).toHaveCount(0);
    await page.goto('/platform/academies', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/platform\/academies/, {
      timeout: 10_000
    });
  });

  test('ADMIN reaches the platform academy management', async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, 'E2E_ADMIN_EMAIL/PASSWORD required');

    await adminLogin(page, email!, password!);
    await page.goto('/platform/academies');
    await expect(page).toHaveURL(/\/platform\/academies/);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });
});
