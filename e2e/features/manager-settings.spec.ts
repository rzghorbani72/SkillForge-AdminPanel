import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager settings pages @backend.
 * Covers: profile, academy, security, payment-gateway, pricing, ui-template.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-settings.spec.ts
 */
test.describe('Manager settings @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  test('profile settings page loads and shows form fields', async ({ page }) => {
    await page.goto('/settings/profile');
    await expect(page).toHaveURL(/\/settings\/profile/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    // Profile form has at least a name input
    await expect(page.locator('input').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('academy settings page loads', async ({ page }) => {
    await page.goto('/settings/academy');
    await expect(page).toHaveURL(/\/settings\/academy/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('security settings page loads', async ({ page }) => {
    await page.goto('/settings/security');
    await expect(page).toHaveURL(/\/settings\/security/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('payment gateway settings page loads', async ({ page }) => {
    await page.goto('/settings/payment-gateway');
    await expect(page).toHaveURL(/\/settings\/payment-gateway/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('legacy pricing settings route redirects to the academy plans tab', async ({ page }) => {
    await page.goto('/settings/pricing');
    await expect(page).toHaveURL(/\/plans\?tab=academy/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('ui-template settings page loads', async ({ page }) => {
    await page.goto('/settings/ui-template');
    await expect(page).toHaveURL(/\/settings\/ui-template/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('profile page has a save/submit button', async ({ page }) => {
    await page.goto('/settings/profile');
    const saveBtn = page
      .locator('button')
      .filter({ hasText: /save|submit|ذخیره/i })
      .first();
    await expect(saveBtn).toBeVisible({ timeout: 10_000 });
  });
});
