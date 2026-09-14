import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for AdminPanel auth/account UI flows.
 *
 * - `validation` specs run with NO backend (client-side form validation only)
 *   and are what CI/local can verify out of the box.
 * - `@backend`-tagged specs (happy-path login/register) need the API running on
 *   :3000 with a seeded manager; opt in with `E2E_BACKEND=1`. See e2e/README.md.
 */
const PORT = 4000;
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    locale: 'fa-IR',
  },
  projects: [
    // Use the system-installed Google Chrome (`channel: 'chrome'`). Playwright's
    // bundled browsers don't install on every Linux version; set
    // PLAYWRIGHT_CHANNEL=chromium to use a downloaded browser where available.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
      },
    },
  ],
  // Auto-start the AdminPanel dev server unless one is already running.
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
