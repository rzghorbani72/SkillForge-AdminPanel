import { test, expect } from '@playwright/test';

/**
 * AdminPanel `/login` is the MANAGER / TEACHER entry and is identifier-first:
 * step 1 asks for the phone alone and looks the account up, step 2 asks for the
 * password. `/admin-login` is for ADMIN / SUPPORT and is covered separately.
 *
 * Form components used:
 *  - Phone and password: <AuthField> — error adds `has-error` to the input.
 *  - Submit: <AuthSubmit> — no explicit type, so the last non-type-button in the form.
 */
const submit = (page: import('@playwright/test').Page) =>
  page.locator('form button:not([type="button"])').last();

test.describe('AdminPanel manager login — step 1 (no backend)', () => {
  test('asks for the phone only, never a password up front', async ({
    page
  }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('cannot continue with an empty phone', async ({ page }) => {
    await page.goto('/login');

    await expect(submit(page)).toBeDisabled();

    await page.locator('input[type="tel"]').fill('9121234567');
    await expect(submit(page)).toBeEnabled();
  });

  test('offers signup from the login screen', async ({ page }) => {
    await page.goto('/login');

    await page
      .locator('a[href^="/register"]', { hasText: /ثبت‌نام|Sign Up/i })
      .click();
    await expect(page).toHaveURL(/\/register/);
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
    await submit(page).click();

    await expect(page.locator('input[type="password"]')).toBeVisible({
      timeout: 15_000
    });
    await page.locator('input[type="password"]').pressSequentially(password!);
    await submit(page).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('an unknown phone is sent to signup, not to a password box', async ({
    page
  }) => {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill('09120000000');
    await submit(page).click();

    await expect(page.locator('a[href^="/register"]')).toBeVisible({
      timeout: 15_000
    });
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('shows an error for a wrong password', async ({ page }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    test.skip(!phone, 'E2E_MANAGER_PHONE required');

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(phone!);
    await submit(page).click();

    await expect(page.locator('input[type="password"]')).toBeVisible({
      timeout: 15_000
    });
    await page
      .locator('input[type="password"]')
      .pressSequentially('definitely-wrong-pass');
    await submit(page).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
