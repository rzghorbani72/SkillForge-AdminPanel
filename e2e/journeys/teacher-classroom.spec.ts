import { expect, test } from '@playwright/test';

import { teacherLogin } from '../helpers/auth';

// Runs against the academy made by `pnpm --dir ../Backend e2e:seed` (E2E_* env).
// The seed leaves one ungraded submission and a class meeting inside its join window.
test.describe('@backend teacher journey: grading and live class', () => {
  // One teacher account, and the platform keeps only 2 sessions per person.
  test.describe.configure({ mode: 'serial' });
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('grades a submission and it shows as graded', async ({ page }) => {
    await teacherLogin(page);
    await page.goto('/assignments');

    const row = page.getByRole('row').filter({ hasText: 'تکلیف درس دوم' });
    await row.getByRole('button', { name: 'نمره‌دهی' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('#score').fill('8');
    await dialog.locator('#feedback').fill('بازخورد آزمون خودکار');
    await dialog.getByRole('button', { name: 'ذخیره نمره' }).click();

    await expect(dialog).toBeHidden();
    await expect(row).toContainText('۸ / ۱۰');
  });

  test('sees the class roster and can join the open meeting', async ({ page }) => {
    await teacherLogin(page);
    await page.goto(`/courses/${process.env.E2E_LIVE_COURSE_ID}/live/${process.env.E2E_GROUP_ID}`);

    await expect(page.getByText('E2E Live Student')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: 'ورود به جلسه' }).first()).toBeVisible();
  });
});
