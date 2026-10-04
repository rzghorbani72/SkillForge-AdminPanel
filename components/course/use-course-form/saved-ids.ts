import { emptySeason, type LessonDraft, type SeasonDraft } from '../course-drafts';
import type { CourseContentPayload } from './build-course-payload';

type IdMap = Record<string, string>;

export type SavedIds = { seasonIds?: IdMap; lessonIds?: IdMap };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toIdMap(value: unknown): IdMap | undefined {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return Object.fromEntries(entries);
}

/**
 * The backend never learns a draft's clientKey — it only echoes back which
 * real id it created for it. Without writing that id back, every draft still
 * missing one gets CREATED AGAIN on the next save instead of updated.
 */
export function readSavedIds(responseData: unknown): SavedIds {
  const body = isRecord(responseData) ? responseData.data : undefined;
  if (!isRecord(body)) return {};
  return { seasonIds: toIdMap(body.season_ids), lessonIds: toIdMap(body.lesson_ids) };
}

export function withSavedSeasonIds(
  prev: SeasonDraft[],
  payload: CourseContentPayload,
  seasonIds: IdMap | undefined,
): SeasonDraft[] {
  const seasonKeysWithLessons = new Set(
    payload.lessons.map((l) => l.season_client_key).filter((key): key is string => !!key),
  );
  const next = prev.map((s) => {
    if (!seasonKeysWithLessons.has(s.clientKey)) return { ...s, id: undefined };
    const savedId = seasonIds?.[s.clientKey];
    return savedId ? { ...s, id: savedId } : s;
  });
  return next.length > 0 ? next : [emptySeason()];
}

export function withSavedLessonIds(prev: LessonDraft[], lessonIds: IdMap | undefined) {
  if (!lessonIds) return prev;
  return prev.map((l) => (lessonIds[l.clientKey] ? { ...l, id: lessonIds[l.clientKey] } : l));
}

/** Includes the new ids, or the next autosave looks "changed" and re-creates them. */
export function savedFingerprint(payload: CourseContentPayload, ids: SavedIds): string {
  return JSON.stringify({
    ...payload,
    seasons: payload.seasons.map((s) => ({ ...s, id: s.id ?? ids.seasonIds?.[s.client_key] })),
    lessons: payload.lessons.map((l) => ({ ...l, id: l.id ?? ids.lessonIds?.[l.client_key] })),
  });
}
