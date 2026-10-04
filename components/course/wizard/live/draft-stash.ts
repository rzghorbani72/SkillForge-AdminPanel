import type { LiveClassDraft } from './live-class-draft';

const keyOf = (courseId: string) => `live-class-draft:${courseId}`;

const isDraft = (value: unknown): value is LiveClassDraft =>
  typeof value === 'object' &&
  value !== null &&
  'classes' in value &&
  Array.isArray(value.classes) &&
  value.classes.length > 0;

/** A class not yet on the server survives a closed tab on this device only. */
export function readStash(courseId: string): LiveClassDraft | null {
  try {
    const raw = window.localStorage.getItem(keyOf(courseId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStash(courseId: string, draft: LiveClassDraft): void {
  try {
    window.localStorage.setItem(keyOf(courseId), JSON.stringify(draft));
  } catch {
    // Storage blocked: the draft still lives in memory for this visit.
  }
}

export function clearStash(courseId: string): void {
  try {
    window.localStorage.removeItem(keyOf(courseId));
  } catch {
    // Nothing to clear.
  }
}
