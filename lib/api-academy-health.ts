import { call } from './api-call';

export type HealthStatus = 'ok' | 'degraded' | 'quiet';

export interface HealthSignals {
  status: HealthStatus;
  db_latency_ms: number;
  server_errors_24h: number;
  client_errors_24h: number;
  paid_payments_24h: number;
  failed_payments_24h: number;
  logins_24h: number;
  active_learners_60m: number;
  last_activity_at: string | null;
}

export interface HealthDailyPoint {
  day: string;
  logins: number;
  registrations: number;
  active_watchers: number;
  paid_count: number;
  paid_amount: number;
  failed_count: number;
  client_4xx: number;
  server_5xx: number;
}

export interface HealthTopError {
  path: string;
  status_code: number | null;
  count: number;
}

export interface HealthTopPaymentFailure {
  reason: string;
  count: number;
}

export interface HealthSeries {
  days: number;
  /** The error trail is short-lived, so it can cover fewer days than `days`. */
  errors_window_days: number;
  points: HealthDailyPoint[];
  top_errors: HealthTopError[];
  top_payment_failures: HealthTopPaymentFailure[];
}

export const HEALTH_RANGES = [7, 30, 90] as const;
export type HealthRange = (typeof HEALTH_RANGES)[number];

export const getAcademyHealthSignals = (signal?: AbortSignal) =>
  call<HealthSignals>('/academy-health/signals', { signal });

export const getAcademyHealthSeries = (
  days: HealthRange,
  signal?: AbortSignal
) => call<HealthSeries>(`/academy-health/series?days=${days}`, { signal });
