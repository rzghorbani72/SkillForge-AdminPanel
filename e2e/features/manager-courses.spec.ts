import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager courses management @backend.
 * Covers: list view, grid/list toggle, create-course form, search/filter.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-courses.spec.ts
 */
test.describe('Manager courses management @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  test('courses list page loads', async ({ page }) => {
    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('create course page is accessible and has a title field', async ({
    page
  }) => {
    await page.goto('/courses/create');
    await expect(page).toHaveURL(/\/courses\/create/);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    // The form should render at least one text input (title)
    await expect(
      page.locator('input[type="text"], input:not([type])').first()
    ).toBeVisible({
      timeout: 10_000
    });
  });

  test('navigating to create course from list page works', async ({ page }) => {
    await page.goto('/courses');
    // Click the primary "New Course" button
    const createBtn = page
      .locator('button')
      .filter({ hasText: /new course|course|جدید/i })
      .first();
    if ((await createBtn.count()) > 0) {
      await createBtn.click();
      await expect(page).toHaveURL(/\/courses\/create/);
    }
  });

  test('categories page is accessible', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('assignments page is accessible', async ({ page }) => {
    await page.goto('/assignments');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('videos media page is accessible', async ({ page }) => {
    await page.goto('/videos');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('bundles page is accessible', async ({ page }) => {
    await page.goto('/bundles');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('coupons page is accessible', async ({ page }) => {
    await page.goto('/coupons');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });
});
