import posthog from 'posthog-js';
import type { AnalyticsEvent, AnalyticsEvents } from './events';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
/** Same-origin proxy (next.config rewrites → POSTHOG_HOST) so CSP and ad-blockers stay out of the way. */
const INGEST_PATH = '/ingest';

let ready = false;

export function initAnalytics(): void {
  if (ready || typeof window === 'undefined' || !KEY) return;
  posthog.init(KEY, {
    api_host: INGEST_PATH,
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: false,
    persistence: 'localStorage+cookie',
    mask_all_text: true,
    session_recording: { maskAllInputs: true }
  });
  ready = true;
}

export interface AnalyticsIdentity {
  user_id?: string | number | null;
  academy_id?: string | number | null;
  role?: string | null;
}

/** Called wherever the signed-in identity changes (same places as setLogContext). */
export function identifyAnalytics({
  user_id,
  academy_id,
  role
}: AnalyticsIdentity): void {
  if (!ready) return;
  if (user_id == null) {
    posthog.reset();
    return;
  }
  posthog.identify(String(user_id), { role: role ?? undefined });
  if (academy_id != null) posthog.group('academy', String(academy_id));
}

export function track<E extends AnalyticsEvent>(
  event: E,
  props: AnalyticsEvents[E]
): void {
  if (!ready) return;
  posthog.capture(event, props);
}
