import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager financial pages @backend.
 * Covers: academy payments, revenue, costs, reports, orders.
 * Also verifies the manager CANNOT access the platform-level financial screen.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-financial.spec.ts
 */
test.describe('Manager financial pages @backend', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 to run against the API');

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  test('academy financial page shows success and failed tabs', async ({ page }) => {
    await page.goto('/financial/academy');
    await expect(page.getByRole('button', { name: 'موفق', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ناموفق', exact: true })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('academy payments page loads', async ({ page }) => {
    await page.goto('/financial/academy/payments');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('academy revenue page loads', async ({ page }) => {
    await page.goto('/financial/academy/revenue');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('academy costs page loads', async ({ page }) => {
    await page.goto('/financial/academy/costs');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('academy reports page loads', async ({ page }) => {
    await page.goto('/financial/academy/reports');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('orders page loads', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('refunds page loads', async ({ page }) => {
    await page.goto('/refunds');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('HACKER — manager cannot access platform-level financial screen', async ({ page }) => {
    await page.goto('/financial/platform', { waitUntil: 'domcontentloaded' });
    // Must be bounced — never render the platform screen
    await expect(page).not.toHaveURL(/\/financial\/platform/, {
      timeout: 10_000,
    });
  });

  test('analytics courses page loads', async ({ page }) => {
    await page.goto('/analytics/courses');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('analytics revenue page loads', async ({ page }) => {
    await page.goto('/analytics/revenue');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

  test('analytics engagement page loads', async ({ page }) => {
    await page.goto('/analytics/engagement');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
