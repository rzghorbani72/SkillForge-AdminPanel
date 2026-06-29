import { Page, expect } from '@playwright/test';

export const MANAGER_PHONE = process.env.E2E_MANAGER_PHONE ?? '09214432309';
export const MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? '123456';

const submit = (page: Page) =>
  page.locator('form button:not([type="button"])').last();

export async function managerLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('input[type="tel"]').fill(MANAGER_PHONE);
  await page
    .locator('input[type="password"]')
    .pressSequentially(MANAGER_PASSWORD);
  await submit(page).click();
  // Manager lands on /dashboard or /onboarding/create-academy — either way, not /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}
