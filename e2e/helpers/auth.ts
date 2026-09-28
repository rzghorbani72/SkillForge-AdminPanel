import { Page, expect } from '@playwright/test';
import { solveHumanCheck } from './human-check';

// Set E2E_* to a manager/teacher that exist in your local dev DB.
export const MANAGER_PHONE = process.env.E2E_MANAGER_PHONE ?? '09123334444';
export const MANAGER_PASSWORD = process.env.E2E_MANAGER_PASSWORD ?? 'Passw0rd!';
export const TEACHER_PHONE = process.env.E2E_TEACHER_PHONE ?? '09123336666';
export const TEACHER_PASSWORD = process.env.E2E_TEACHER_PASSWORD ?? 'Passw0rd!';

const submit = (page: Page) => page.locator('form button:not([type="button"])').last();

async function staffLogin(page: Page, phone: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.locator('input[type="tel"]').fill(phone);
  await page.locator('input[type="password"]').pressSequentially(password);
  await solveHumanCheck(page);
  await submit(page).click();
  // Lands on /dashboard or /onboarding/create-academy — either way, not /login.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

export async function managerLogin(page: Page): Promise<void> {
  await staffLogin(page, MANAGER_PHONE, MANAGER_PASSWORD);
}

export async function teacherLogin(page: Page): Promise<void> {
  await staffLogin(page, TEACHER_PHONE, TEACHER_PASSWORD);
}
