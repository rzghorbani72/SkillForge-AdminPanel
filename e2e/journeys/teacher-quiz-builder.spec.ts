import { expect, test } from '@playwright/test';

import { teacherLogin } from '../helpers/auth';

// Runs against `pnpm --dir ../Backend e2e:seed`: it leaves a hidden lesson with no quiz.
test.describe('@backend teacher journey: quiz builder', () => {
  test.skip(!process.env.E2E_BACKEND, 'set E2E_BACKEND=1 and run the Backend e2e:seed first');

  test('builds a required quiz drawn from a question bank and publishes it', async ({ page }) => {
    await teacherLogin(page);
    await page.goto(
      `/courses/${process.env.E2E_QUIZ_COURSE_ID}/lessons/${process.env.E2E_QUIZ_AUTHORING_LESSON_ID}`,
    );

    await page.getByPlaceholder('عنوان آزمون').fill('آزمون ساخته‌شده در مرورگر');
    await page.getByPlaceholder('همهٔ سؤال‌ها').fill('1');
    await page.getByRole('switch', { name: /دانشجو باید قبول شود/ }).click();
    await page.getByRole('button', { name: 'ساخت آزمون' }).click();
    await expect(page.getByText('قبولی اجباری')).toBeVisible();

    await page.locator('textarea').fill('پایتخت ایران کجاست؟');
    await page.getByPlaceholder('گزینه 1').fill('تهران');
    await page.getByPlaceholder('گزینه 2').fill('اصفهان');
    await page.getByRole('button', { name: 'افزودن سؤال' }).click();
    await expect(page.getByText('پایتخت ایران کجاست؟')).toBeVisible();

    await page.getByRole('button', { name: 'انتشار' }).click();
    await expect(page.getByRole('button', { name: 'لغو انتشار' })).toBeVisible();
  });
});
