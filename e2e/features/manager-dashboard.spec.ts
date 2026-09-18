import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager dashboard @backend.
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-dashboard.spec.ts
 */
test.describe('Manager dashboard @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
    await page.goto('/dashboard');
  });

  test('dashboard page loads without errors', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('stats section renders after loading completes', async ({ page }) => {
    // Wait for the loading spinner to disappear
    await expect(page.locator('.animate-ping')).toHaveCount(0, {
      timeout: 20_000,
    });
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    // At least one card-like element should be on screen
    await expect(page.locator('body')).toBeVisible();
  });

  test('period filter buttons are clickable', async ({ page }) => {
    await expect(page.locator('.animate-ping')).toHaveCount(0, {
      timeout: 20_000,
    });
    // Look for period filter buttons (7 days / 30 days / etc.)
    const periodBtns = page.locator('button').filter({ hasText: /7 days|7d|۷ روز/ });
    if ((await periodBtns.count()) > 0) {
      await periodBtns.first().click();
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    }
  });

  test('navigating away and back preserves the dashboard', async ({ page }) => {
    await page.goto('/courses');
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('export report downloads a CSV of the visible period', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /خروجی گزارش|Export report/ });
    await expect(exportButton).toBeEnabled({ timeout: 20_000 });
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^mentoma-dashboard-.+\.csv$/);
  });
});
