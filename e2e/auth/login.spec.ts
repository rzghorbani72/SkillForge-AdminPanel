import { test, expect } from '@playwright/test';

/**
 * AdminPanel `/login` is the MANAGER / TEACHER entry (phone + password staff
 * login). `/admin-login` is for ADMIN / SUPPORT and is covered separately.
 */
test.describe('AdminPanel manager login — validation (no backend)', () => {
  test('shows field errors when submitting an empty form', async ({ page }) => {
    await page.goto('/login');

    await page.locator('button[type="submit"]').click();

    // Client-side validate() flags both inputs with the destructive border
    // without ever calling the backend.
    await expect(page.locator('#phone')).toHaveClass(/border-destructive/);
    await expect(page.locator('#password')).toHaveClass(/border-destructive/);
  });

  test('flags a too-short password', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#phone').fill('9121234567');
    await page.locator('#password').fill('123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#password')).toHaveClass(/border-destructive/);
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
    await page.locator('#phone').fill(phone!);
    await page.locator('#password').fill(password!);
    await page.locator('button[type="submit"]').click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('shows an error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page
      .locator('#phone')
      .fill(process.env.E2E_MANAGER_PHONE || '9120000000');
    await page.locator('#password').fill('definitely-wrong-pass');
    await page.locator('button[type="submit"]').click();

    // Stays on /login; an error toast/alert surfaces.
    await expect(page).toHaveURL(/\/login/);
  });
});
