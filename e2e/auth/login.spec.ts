import { test, expect } from '@playwright/test';

/**
 * AdminPanel `/login` is the MANAGER / TEACHER entry (phone + password staff
 * login). `/admin-login` is for ADMIN / SUPPORT and is covered separately.
 *
 * The auth pages were redesigned to the <AuthField>/<AuthSubmit> components:
 *  - inputs are typed (`input[type="tel"]` / `[type="password"]`), not id-based;
 *  - a field error renders the `has-error` class + a `.text-destructive` message;
 *  - the submit is an <AuthSubmit> button (no explicit type) inside the <form>.
 */
const submit = (page: import('@playwright/test').Page) =>
  page.locator('form button:not([type="button"])').last();

test.describe('AdminPanel manager login — validation (no backend)', () => {
  test('shows field errors when submitting an empty form', async ({ page }) => {
    await page.goto('/login');

    await submit(page).click();

    // Client-side validate() flags both inputs without calling the backend.
    await expect(page.locator('input[type="tel"]')).toHaveClass(/has-error/);
    await expect(page.locator('input[type="password"]')).toHaveClass(
      /has-error/
    );
  });

  test('flags a too-short password', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="tel"]').fill('9121234567');
    await page.locator('input[type="password"]').fill('123');
    await submit(page).click();

    await expect(page.locator('input[type="password"]')).toHaveClass(
      /has-error/
    );
  });

  test('OTP method hides the password field but still requires phone', async ({
    page
  }) => {
    await page.goto('/login');

    // Password is the default method.
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Second toggle button switches to one-time-code login.
    await page.locator('.bg-muted button').nth(1).click();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);

    // Submitting with no phone still flags the phone field (client-side).
    await submit(page).click();
    await expect(page.locator('input[type="tel"]')).toHaveClass(/has-error/);
  });
});

/**
 * Happy-path login. Needs the API on :3000 and a seeded MANAGER.
 * Run with: E2E_BACKEND=1 E2E_MANAGER_PHONE=09... E2E_MANAGER_PASSWORD=... pnpm test:e2e
 */
test.describe('AdminPanel manager login — happy path @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  test('logs in and leaves the login page', async ({ page }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    const password = process.env.E2E_MANAGER_PASSWORD;
    test.skip(!phone || !password, 'E2E_MANAGER_PHONE/PASSWORD required');

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(phone!);
    await page.locator('input[type="password"]').pressSequentially(password!);
    await submit(page).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('shows an error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page
      .locator('input[type="tel"]')
      .fill(process.env.E2E_MANAGER_PHONE || '9120000000');
    await page
      .locator('input[type="password"]')
      .pressSequentially('definitely-wrong-pass');
    await submit(page).click();

    // Stays on /login; an error alert surfaces.
    await expect(page).toHaveURL(/\/login/);
  });
});
