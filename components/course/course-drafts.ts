/**
 * Shapes and pure helpers shared by the course builder: the in-progress season
 * and lesson drafts, and the rules that turn them into what the API expects.
 */

import { toEnglishDigits } from '@/lib/phone-utils';

// ─── Draft types ──────────────────────────────────────────────────────────────

export type LessonType =
  | 'VIDEO'
  | 'AUDIO'
  | 'TEXT'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'LIVE';

export interface LessonDraft {
  id?: string;
  title: string;
  description: string;
  /** Lesson length as mm:ss (stored on the backend as whole seconds) */
  duration: string;
  lesson_type: LessonType;
  is_free: boolean;
  published: boolean;
  video_id?: string;
  audio_id?: string;
  cover_id?: string;
  document_id?: string;
  videoPreviewUrl?: string;
  audioPreviewUrl?: string;
  coverPreviewUrl?: string;
  documentPreviewName?: string;
  clientKey: string;
  /** clientKey of the SeasonDraft this lesson belongs to (undefined = unassigned) */
  seasonClientKey?: string;
}

export interface SeasonDraft {
  id?: string;
  title: string;
  clientKey: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _keyCounter = 0;
export const newKey = () => `k-${++_keyCounter}`;

export const DEFAULT_DURATION = '00:00';

/** mm:ss (or hh:mm:ss) → whole seconds. Bad input falls back to 0. */
export function durationToSeconds(value: string): number {
  const parts = toEnglishDigits(value)
    .split(':')
    .map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

/** Whole seconds → mm:ss, or hh:mm:ss once it passes an hour (zero-padded). */
export function secondsToDuration(total?: number | null): string {
  if (!total || total < 0) return DEFAULT_DURATION;
  const whole = Math.round(total);
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = Math.floor(whole / 3600);
  const mins = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  return hours > 0
    ? `${pad(hours)}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
}

/** Total playtime of a set of lessons, in whole seconds. */
export function sumDurationSeconds(lessons: LessonDraft[]): number {
  return lessons.reduce((total, l) => total + durationToSeconds(l.duration), 0);
}

/** True when the lesson's length is measured from a file instead of typed. */
export function hasTimedMedia(lesson: LessonDraft): boolean {
  if (lesson.lesson_type === 'VIDEO') return !!lesson.videoPreviewUrl;
  if (lesson.lesson_type === 'AUDIO') return !!lesson.audioPreviewUrl;
  return false;
}

/**
 * Pre-publish gate. Returns a translation key for the first problem found, or
 * null when the curriculum is publishable. Kept pure so it is unit-testable.
 */
/**
 * Seasons with no titled lessons are UI placeholders only — they must not be
 * written to the API (and any existing DB row should be deleted).
 */
export function prepareCurriculumForSave(
  seasons: SeasonDraft[],
  lessons: LessonDraft[],
  deletedSeasonIds: string[]
): {
  seasons: SeasonDraft[];
  lessons: LessonDraft[];
  deletedSeasonIds: string[];
} {
  const lessonsToSave = lessons.filter((l) => l.title.trim());
  const seasonKeysWithLessons = new Set(
    lessonsToSave
      .map((l) => l.seasonClientKey)
      .filter((key): key is string => !!key)
  );

  const orphanSeasonIds = seasons
    .filter((s) => s.id && !seasonKeysWithLessons.has(s.clientKey))
    .map((s) => s.id!);

  return {
    seasons: seasons.filter((s) => seasonKeysWithLessons.has(s.clientKey)),
    lessons: lessonsToSave,
    deletedSeasonIds: Array.from(
      new Set([...deletedSeasonIds, ...orphanSeasonIds])
    )
  };
}

export function validateForPublish(
  seasons: SeasonDraft[],
  lessons: LessonDraft[]
): string | null {
  // Season titles are not checked: an untitled season is saved under its
  // number rather than dropped, so it can never block publishing.
  if (lessons.some((l) => !l.title.trim())) {
    return 'courses.publishLessonTitleRequired';
  }
  const hasEmptySeason = seasons.some(
    (s) => !lessons.some((l) => l.seasonClientKey === s.clientKey)
  );
  if (hasEmptySeason) return 'courses.publishEmptySeason';
  if (lessons.length === 0) return 'courses.publishNeedsLesson';
  return null;
}

/** Drop media fields that do not belong to the selected lesson type. */
export function clearIncompatibleMedia(type: LessonType): Partial<LessonDraft> {
  const clearAll: Partial<LessonDraft> = {
    video_id: undefined,
    audio_id: undefined,
    cover_id: undefined,
    document_id: undefined,
    videoPreviewUrl: undefined,
    audioPreviewUrl: undefined,
    coverPreviewUrl: undefined,
    documentPreviewName: undefined
  };

  if (type === 'VIDEO') {
    return {
      audio_id: undefined,
      audioPreviewUrl: undefined,
      cover_id: undefined,
      coverPreviewUrl: undefined,
      document_id: undefined,
      documentPreviewName: undefined
    };
  }
  if (type === 'AUDIO') {
    return {
      video_id: undefined,
      videoPreviewUrl: undefined,
      cover_id: undefined,
      coverPreviewUrl: undefined,
      document_id: undefined,
      documentPreviewName: undefined
    };
  }
  if (type === 'TEXT' || type === 'QUIZ' || type === 'ASSIGNMENT') {
    return {
      video_id: undefined,
      videoPreviewUrl: undefined,
      audio_id: undefined,
      audioPreviewUrl: undefined,
      cover_id: undefined,
      coverPreviewUrl: undefined
    };
  }
  // LIVE — no media upload
  return clearAll;
}

export const emptyLesson = (seasonClientKey?: string): LessonDraft => ({
  title: '',
  description: '',
  duration: DEFAULT_DURATION,
  lesson_type: 'VIDEO',
  is_free: false,
  published: false,
  clientKey: newKey(),
  seasonClientKey
});

export const emptySeason = (): SeasonDraft => ({
  title: '',
  clientKey: newKey()
});

function extractId(resp: unknown): string | undefined {
  const r = resp as Record<string, unknown>;
  return (r?.data as any)?.data?.id ?? (r?.data as any)?.id ?? (r as any)?.id;
}
