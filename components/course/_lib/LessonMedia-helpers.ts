export type SlotKey = 'video' | 'audio' | 'document' | 'cover';

/**
 * Info slots — the attachment box and the live-class hint. These hold a line of
 * text, not a picture, and they span a whole row on their own: a 16:9 ratio
 * there would stretch a one-line label into a huge empty panel.
 */
export const LESSON_INFO_SLOT_CLASS = 'h-40 w-full';

export function revokeIfBlob(url: string | undefined) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}
