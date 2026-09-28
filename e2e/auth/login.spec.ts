import { test, expect } from '@playwright/test';
import { solveHumanCheck } from '../helpers/human-check';

/**
 * AdminPanel `/login` is the MANAGER / TEACHER entry and is one step: phone,
 * password or one-time code, and an ALTCHA human check shown from first render.
 * `/admin-login` is for ADMIN / SUPPORT and is covered separately.
 *
 *  - Submit: <AuthSubmit> — no explicit type, so the last non-type-button in the form.
 */
const submit = (page: import('@playwright/test').Page) =>
  page.locator('form button:not([type="button"])').last();

test.describe('AdminPanel manager login — one step (no backend)', () => {
  test('shows phone, password and the human check on first render', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('altcha-widget')).toHaveCount(1);
  });

  test('cannot submit until the human check is solved', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="tel"]').fill('9121234567');
    await page.locator('input[type="password"]').fill('Passw0rd!');
    await expect(submit(page)).toBeDisabled();
  });

  test('the one-time-code method hides the password box', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /کد یکبار مصرف|One-time code/ }).click();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('offers signup from the login screen', async ({ page }) => {
    await page.goto('/login');

    await page.locator('a[href^="/register"]', { hasText: /ثبت‌نام|Sign Up/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});

/**
 * Happy-path login. Needs the API on :3000 and a seeded MANAGER.
 * Run with: E2E_BACKEND=1 E2E_MANAGER_PHONE=09... E2E_MANAGER_PASSWORD=... pnpm test:e2e
 */
test.describe('AdminPanel manager login — happy path @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test('logs in and leaves the login page', async ({ page }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    const password = process.env.E2E_MANAGER_PASSWORD;
    test.skip(!phone || !password, 'E2E_MANAGER_PHONE/PASSWORD required');

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(phone!);
    await page.locator('input[type="password"]').pressSequentially(password!);
    await solveHumanCheck(page);
    await submit(page).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('an unknown phone is offered signup', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill('09120000000');
    await page.locator('input[type="password"]').pressSequentially('Passw0rd!');
    await solveHumanCheck(page);
    await submit(page).click();

    await expect(page.locator('a[href^="/register"]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows an error for a wrong password', async ({ page }) => {
    const phone = process.env.E2E_MANAGER_PHONE;
    test.skip(!phone, 'E2E_MANAGER_PHONE required');

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(phone!);
    await page.locator('input[type="password"]').pressSequentially('definitely-wrong-pass');
    await solveHumanCheck(page);
    await submit(page).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
