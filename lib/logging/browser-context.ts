import * as Sentry from '@sentry/nextjs';
import type { LogFields } from './logger';

export interface BrowserLogContext {
  user_id?: string | number | null;
  academy_id?: string | number | null;
  role?: string | null;
}

let context: LogFields = {};

/** Called by the auth/store providers whenever the signed-in identity changes. */
export function setLogContext(next: BrowserLogContext): void {
  context = Object.fromEntries(Object.entries(next).filter(([, v]) => v != null));
  // Same identity on Sentry events so a crash and its log lines share academy_id/user_id.
  Sentry.setUser(next.user_id != null ? { id: String(next.user_id) } : null);
  Sentry.setTags({
    academy_id: next.academy_id != null ? String(next.academy_id) : undefined,
    role: next.role ?? undefined,
  });
}

export const getBrowserContext = (): LogFields => context;
