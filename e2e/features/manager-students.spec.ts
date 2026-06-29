import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager students management @backend.
 * Covers: list view, tabs (managers/teachers/students/users/enrollments/progress),
 * search input, and student-only auth guard on protected sub-routes.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-students.spec.ts
 */
test.describe('Manager students management @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  test('students page loads with all tabs', async ({ page }) => {
    await page.goto('/students');
    await expect(page).toHaveURL(/\/students/);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    // All role tabs should be present
    await expect(page.getByRole('tab', { name: /manager/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /teacher/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /student/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /user/i })).toBeVisible();
  });

  test('search input filters without crashing', async ({ page }) => {
    await page.goto('/students');
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('test');
    // Debounce fires; page should not crash
    await page.waitForTimeout(600);
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    await search.clear();
  });

  test('teachers tab loads content without errors', async ({ page }) => {
    await page.goto('/students?role=TEACHER');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    await expect(page.getByRole('tab', { name: /teacher/i })).toHaveAttribute(
      'data-state',
      'active'
    );
  });

  test('students tab loads content without errors', async ({ page }) => {
    await page.goto('/students?role=STUDENT');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
    await expect(page.getByRole('tab', { name: /student/i })).toHaveAttribute(
      'data-state',
      'active'
    );
  });

  test('enrollments tab loads', async ({ page }) => {
    await page.goto('/students');
    const enrollTab = page.getByRole('tab', { name: /enrollment/i });
    await expect(enrollTab).toBeVisible();
    await enrollTab.click();
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('progress tab loads', async ({ page }) => {
    await page.goto('/students');
    const progressTab = page.getByRole('tab', { name: /progress/i });
    await expect(progressTab).toBeVisible();
    await progressTab.click();
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('manual enroll page is accessible', async ({ page }) => {
    await page.goto('/students/manual-enroll');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });

  test('lesson access page is accessible', async ({ page }) => {
    await page.goto('/students/lesson-access');
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  });
});
