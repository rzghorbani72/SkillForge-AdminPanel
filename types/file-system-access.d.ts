/**
 * Minimal ambient types for the File System Access API (Chromium-only).
 * Not part of TypeScript's bundled DOM lib yet, so declared here rather than
 * pulling in the (unmaintained) @types/wicg-file-system-access package.
 */
interface FileSystemFileHandle {
  getFile(): Promise<File>;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface OpenFilePickerOptions {
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
}

interface Window {
  showOpenFilePicker?: (options?: OpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
}
