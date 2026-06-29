import { test, expect } from '@playwright/test';

/**
 * AdminPanel `/register` — standalone MANAGER sign-up (name, phone, password,
 * confirm). Step 1 is a react-hook-form + zod form; invalid input is rejected
 * client-side (no backend), step 2 is the phone OTP.
 */
test.describe('AdminPanel manager register — validation (no backend)', () => {
  test('rejects mismatched passwords', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[name="name"]').fill('Test Manager');
    // PhoneInputWithCountry renders input[type="tel"] — it does NOT emit name="phone".
    await page.locator('input[type="tel"]').fill('9121234567');
    await page.locator('input[name="password"]').fill('Passw0rd!');
    await page.locator('input[name="confirmPassword"]').fill('Different1!');
    await page.locator('button[type="submit"]').click();

    // shadcn FormMessage renders an element ending in "-form-item-message".
    await expect(
      page.locator('[id$="form-item-message"]').first()
    ).toBeVisible();
    // Still on the details step (no OTP step / backend call happened).
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('rejects a too-short password', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[name="name"]').fill('Test Manager');
    // PhoneInputWithCountry renders input[type="tel"] — it does NOT emit name="phone".
    await page.locator('input[type="tel"]').fill('9121234567');
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirmPassword"]').fill('123');
    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator('[id$="form-item-message"]').first()
    ).toBeVisible();
  });
});
