/**
 * Opens a file picker without going through a hidden <input type="file">
 * click. Chromium's classic <input> picker freezes the tab's paint while the
 * native dialog is open (see LessonMedia.tsx); showOpenFilePicker uses a
 * separate async path that avoids that freeze.
 *
 * Returns:
 * - the picked File
 * - null if the user cancelled the picker
 * - undefined if the File System Access API isn't supported (Firefox,
 *   Safari) or it threw for any other reason — caller should fall back to a
 *   classic <input type="file"> click.
 */
export async function pickFile(accept: string): Promise<File | null | undefined> {
  if (typeof window === 'undefined' || !window.showOpenFilePicker) {
    return undefined;
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      types: acceptToPickerTypes(accept),
      multiple: false,
    });
    return await handle.getFile();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null;
    }
    return undefined;
  }
}

function acceptToPickerTypes(accept: string): FilePickerAcceptType[] | undefined {
  const trimmed = accept.trim();
  if (!trimmed) return undefined;

  // MIME wildcard, e.g. "video/*" — the picker's accept map takes the MIME
  // type itself as the key.
  if (trimmed.includes('/')) {
    return [{ accept: { [trimmed]: [] } }];
  }

  // Extension list, e.g. ".pdf,.doc,.docx" — the picker requires a MIME key,
  // so bucket every extension under a generic binary type.
  const extensions = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (extensions.length === 0) return undefined;

  return [{ accept: { 'application/octet-stream': extensions } }];
}
