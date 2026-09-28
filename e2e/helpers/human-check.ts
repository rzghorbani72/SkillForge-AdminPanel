import { Page, expect } from '@playwright/test';

/** Ticks the ALTCHA box and waits until the proof-of-work is solved (needs the API). */
export async function solveHumanCheck(page: Page): Promise<void> {
  const checkbox = page.locator('altcha-widget input[type="checkbox"]').first();
  await checkbox.check();
  await expect(checkbox).toBeChecked({ timeout: 20_000 });
  // The state lives on the widget's inner element (Playwright pierces its shadow root).
  await expect(page.locator('altcha-widget [data-state="verified"]').first()).toBeAttached({
    timeout: 20_000,
  });
}
