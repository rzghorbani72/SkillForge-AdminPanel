import type { LogFields } from './logger';

export interface BrowserLogContext {
  user_id?: string | number | null;
  academy_id?: string | number | null;
  role?: string | null;
}

let context: LogFields = {};

/** Called by the auth/store providers whenever the signed-in identity changes. */
export function setLogContext(next: BrowserLogContext): void {
  context = Object.fromEntries(
    Object.entries(next).filter(([, v]) => v != null)
  );
}

export const getBrowserContext = (): LogFields => context;
