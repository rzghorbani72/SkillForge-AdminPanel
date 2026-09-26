const DRAFT_KEY = 'academy-create-draft';

export type AcademyCreateDraft = {
  name: string;
  slug: string;
  description: string;
  category: string;
  primaryColor: string;
};

function isDraft(value: unknown): value is AcademyCreateDraft {
  if (typeof value !== 'object' || value === null) return false;
  return (['name', 'slug', 'description', 'category', 'primaryColor'] as const).every(
    (key) => typeof Reflect.get(value, key) === 'string',
  );
}

export function readDraft(): AcademyCreateDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? 'null');
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: AcademyCreateDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearStoredDraft() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}
