import { defineConfig } from '@playwright/test';

/**
 * Pure-logic tests: no browser, no dev server, no backend. These cover the
 * functions that decide what a user may see (nav scoping, page scope), so they
 * must stay runnable in CI with nothing else booted.
 */
export default defineConfig({
  testDir: './tests/unit',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  projects: [{ name: 'logic' }],
});
