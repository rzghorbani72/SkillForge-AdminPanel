import { test, expect } from '@playwright/test';

/**
 * Smoke: the panel's unauthenticated entry pages render without a backend, and
 * the unauthorized + 404 pages render human content (not a crash/stack). Proves
 * the shell + routing before any role journey runs. The redesigned auth uses
 * <AuthField>/<AuthSubmit>, so we assert the form + typed inputs, not ids.
 */
test.describe('AdminPanel public pages (smoke)', () => {
  test('manager /login renders the phone + password form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('platform /admin-login renders a form', async ({ page }) => {
    const res = await page.goto('/admin-login');
    expect(res!.status()).toBeLessThan(400);
    await expect(page.locator('form')).toBeVisible();
  });

  test('/register renders a form', async ({ page }) => {
    const res = await page.goto('/register');
    expect(res!.status()).toBeLessThan(400);
    await expect(page.locator('form')).toBeVisible();
  });

  test('/unauthorized renders a friendly message, not a crash', async ({
    page
  }) => {
    const res = await page.goto('/unauthorized');
    expect(res!.status()).toBeLessThan(500);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('unknown route renders the 404 page, not a crash', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-xyz', {
      waitUntil: 'domcontentloaded'
    });
    expect(res!.status()).toBe(404);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });
});
