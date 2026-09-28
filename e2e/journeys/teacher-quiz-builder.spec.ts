import { expect, test } from '@playwright/test';

import { teacherLogin } from '../helpers/auth';

// Runs against `pnpm --dir ../Backend e2e:seed`: it leaves a hidden lesson with no quiz.
test.describe('@backend teacher journey: quiz builder', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('builds a lesson quiz in a dialog and opens the assignment, season and course dialogs', async ({
    page,
  }) => {
    await teacherLogin(page);
    await page.goto(`/courses/${process.env.E2E_QUIZ_COURSE_ID}/edit?step=content`);
    const row = page
      .locator('[data-lesson-row]')
      .filter({ has: page.locator('input[value="درس ساخت آزمون"]') });
    await page.waitForLoadState('networkidle');
    await row.getByRole('button', { name: 'ویرایش' }).click();
    await row.getByRole('button', { name: 'آزمون', exact: true }).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByPlaceholder('عنوان آزمون').fill('آزمون ساخته‌شده در مرورگر');
    await dialog.getByPlaceholder('همهٔ سؤال‌ها').fill('1');
    await dialog.getByRole('switch', { name: /دانشجو باید قبول شود/ }).click();
    await dialog.getByRole('button', { name: 'ساخت آزمون' }).click();
    await expect(dialog.getByText('قبولی اجباری')).toBeVisible();

    await dialog.locator('textarea').fill('پایتخت ایران کجاست؟');
    await dialog.getByPlaceholder('گزینه ۱').fill('تهران');
    await dialog.getByPlaceholder('گزینه ۲').fill('اصفهان');
    await dialog.getByRole('button', { name: 'افزودن سؤال' }).click();
    await expect(dialog.getByText('پایتخت ایران کجاست؟')).toBeVisible();

    await dialog.getByRole('button', { name: 'انتشار' }).click();
    await expect(dialog.getByRole('button', { name: 'لغو انتشار' })).toBeVisible();

    await page.keyboard.press('Escape');

    await row.getByRole('button', { name: 'تکلیف', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('تکلیف این درس')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'آزمون فصل', exact: true }).first().click();
    await expect(page.getByRole('dialog').getByText('ساخت آزمون برای این فصل')).toBeVisible();
    await page.keyboard.press('Escape');

    // The seed puts the final exam on the course itself, not on a lesson.
    await page.getByRole('button', { name: 'آزمون دوره', exact: true }).click();
    await expect(page.getByRole('dialog').getByText('آزمون پایانی دوره')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/edit\?step=content/);
  });
});
