import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import { managerLogin } from '../helpers/auth';

/**
 * Course lesson media upload @backend.
 *
 * Covers the LessonMedia upload boxes (video/audio/document) end-to-end:
 * pick a real file, watch the progress bar, confirm the preview renders.
 *
 * UploadSlot tries window.showOpenFilePicker() first (Chromium-only — see
 * lib/file-picker.ts) and only falls back to a classic <input type="file">
 * click when that API is unavailable or throws. Playwright's `filechooser`
 * interception only covers the classic <input> path, so the picker path is
 * exercised here by stubbing showOpenFilePicker with a fixture-backed fake;
 * a dedicated test below disables the stub to drive the real fallback via
 * `filechooser` + setInputFiles.
 *
 * Run: E2E_BACKEND=1 pnpm test:e2e e2e/features/course-lesson-media-upload.spec.ts
 */

const FIXTURES_DIR = path.join(__dirname, '../fixtures');

interface FixtureFile {
  base64: string;
  name: string;
  type: string;
}

function loadFixture(fileName: string, mimeType: string): FixtureFile {
  const base64 = readFileSync(path.join(FIXTURES_DIR, fileName)).toString(
    'base64'
  );
  return { base64, name: fileName, type: mimeType };
}

const VIDEO_FIXTURE = loadFixture('tiny-video.mp4', 'video/mp4');
const AUDIO_FIXTURE = loadFixture('tiny-audio.mp3', 'audio/mpeg');
const DOCUMENT_FIXTURE = loadFixture('tiny-document.pdf', 'application/pdf');

/** Replaces showOpenFilePicker with a fake that returns whatever fixture was queued via queuePickedFile(). */
async function stubFilePicker(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const win = window as unknown as {
      showOpenFilePicker: () => Promise<{ getFile: () => Promise<File> }[]>;
      __nextPickedFile?: FixtureFile;
    };
    win.showOpenFilePicker = async () => {
      const queued = win.__nextPickedFile;
      if (!queued) throw new DOMException('no fixture queued', 'AbortError');
      const bytes = Uint8Array.from(atob(queued.base64), (c) =>
        c.charCodeAt(0)
      );
      const file = new File([bytes], queued.name, { type: queued.type });
      return [{ getFile: async () => file }];
    };
  });
}

async function queuePickedFile(
  page: Page,
  fixture: FixtureFile
): Promise<void> {
  await page.evaluate((f) => {
    (window as unknown as { __nextPickedFile?: FixtureFile }).__nextPickedFile =
      f;
  }, fixture);
}

/** Creates a fresh draft course and lands on its curriculum edit page. */
async function createDraftCourse(page: Page, title: string): Promise<void> {
  await page.goto('/courses/create');
  await page.locator('input[name="title"]').fill(title);
  await page
    .locator('textarea[name="description"]')
    .fill('Created by the media-upload e2e spec.');
  await page.locator('form button:not([type="button"])').last().click();
  await expect(page).toHaveURL(/\/courses\/.+\/edit/, { timeout: 20_000 });
}

async function addSeasonAndLesson(page: Page): Promise<void> {
  await page.locator('button:has-text("افزودن فصل")').click();
  await page.locator('button:has-text("افزودن اولین درس")').click();
  await page.locator('button[aria-label="ویرایش"]').last().click();
}

async function setLessonType(
  page: Page,
  typeLabel: 'ویدیو' | 'صدا' | 'متن'
): Promise<void> {
  await page
    .locator('button', { hasText: typeLabel })
    .filter({ hasText: typeLabel })
    .last()
    .click();
}

test.describe('Course lesson media upload @backend', () => {
  test.skip(
    !process.env.E2E_BACKEND,
    'set E2E_BACKEND=1 to run against the API'
  );

  test.beforeEach(async ({ page }) => {
    await managerLogin(page);
  });

  test('uploads video, audio and a document across three lessons (File System Access path)', async ({
    page
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await stubFilePicker(page);
    await createDraftCourse(page, 'E2E Media Upload — FS Access');

    // Lesson 1: VIDEO — the type LessonMedia defaults new lessons to.
    await addSeasonAndLesson(page);
    await queuePickedFile(page, VIDEO_FIXTURE);
    await page.locator('label:has-text("آپلود ویدیو")').click();
    await expect(page.locator('video')).toBeVisible({ timeout: 15_000 });

    // Lesson 2: AUDIO.
    await page.locator('button:has-text("افزودن درس")').first().click();
    const lessonRows = page.locator('button[aria-label="ویرایش"]');
    await lessonRows.last().click();
    await setLessonType(page, 'صدا');
    await queuePickedFile(page, AUDIO_FIXTURE);
    await page.locator('label:has-text("آپلود صدا")').click();
    await expect(page.locator('audio')).toBeVisible({ timeout: 15_000 });

    // Lesson 3: TEXT — LessonMedia shows the document slot for TEXT lessons.
    await page.locator('button:has-text("افزودن درس")').first().click();
    await lessonRows.last().click();
    await setLessonType(page, 'متن');
    await queuePickedFile(page, DOCUMENT_FIXTURE);
    await page.locator('label:has-text("آپلود سند")').click();
    await expect(page.getByText('tiny-document.pdf')).toBeVisible({
      timeout: 15_000
    });

    expect(
      consoleErrors,
      `expected no console errors, got:\n${consoleErrors.join('\n')}`
    ).toHaveLength(0);
  });

  test('falls back to the classic file input when showOpenFilePicker is unavailable', async ({
    page
  }) => {
    // Simulate a browser without the File System Access API (Firefox/Safari).
    await page.addInitScript(() => {
      delete (window as unknown as { showOpenFilePicker?: unknown })
        .showOpenFilePicker;
    });

    await createDraftCourse(page, 'E2E Media Upload — classic input');
    await addSeasonAndLesson(page);

    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5_000 }),
      page.locator('label:has-text("آپلود ویدیو")').click()
    ]);
    await chooser.setFiles(path.join(FIXTURES_DIR, 'tiny-video.mp4'));

    await expect(page.locator('video')).toBeVisible({ timeout: 15_000 });
  });
});
