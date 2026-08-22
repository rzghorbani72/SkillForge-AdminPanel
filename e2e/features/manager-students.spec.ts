import { test, expect } from '@playwright/test';
import { managerLogin } from '../helpers/auth';

/**
 * Manager people management @backend.
 * Students, teachers, managers, groups, requests, enrolments and progress all
 * live on /users now; roles are a filter, not separate pages.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/manager-students.spec.ts
 */
test.describe('Manager people management @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  async function expectNoServerError(page: import('@playwright/test').Page) {
    await expect(page.locator('body')).not.toContainText(
      'Internal Server Error'
    );
  }

  test('old students routes redirect into the users hub', async ({ page }) => {
    await page.goto('/students');
    await expect(page).toHaveURL(/\/users/);
    await expectNoServerError(page);
  });

  test('users page loads with every people tab', async ({ page }) => {
    await page.goto('/users');
    await expectNoServerError(page);
    for (const name of [/group/i, /enrol/i, /request/i]) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  test('search input filters without crashing', async ({ page }) => {
    await page.goto('/users');
    const search = page.getByPlaceholder(/search/i).first();
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('test');
    await page.waitForTimeout(600);
    await expectNoServerError(page);
    await search.clear();
  });

  test('role filter deep links load', async ({ page }) => {
    for (const role of ['STUDENT', 'TEACHER', 'MANAGER']) {
      await page.goto(`/users?role=${role}`);
      await expectNoServerError(page);
    }
  });

  test('enrollments and teacher-request tabs load', async ({ page }) => {
    for (const tab of ['enrollments', 'requests']) {
      await page.goto(`/users?tab=${tab}`);
      await expectNoServerError(page);
    }
  });

  test('manual enroll page is accessible', async ({ page }) => {
    await page.goto('/users/manual-enroll');
    await expectNoServerError(page);
  });

  test('lesson access page is accessible', async ({ page }) => {
    await page.goto('/users/lesson-access');
    await expectNoServerError(page);
  });
});
