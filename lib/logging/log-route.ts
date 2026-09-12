import type {
  LogApp,
  LogEntry,
  LogLevel,
  LogPrimitive,
  LogSink
} from './logger';

const NAME_RE = /^[A-Z][A-Za-z0-9]{1,40}$/;
const LEVELS: readonly LogLevel[] = ['info', 'warn', 'error'];
const MAX_KEYS = 30;
const MAX_STRING = 2000;
export const MAX_ENTRIES = 50;
export const MAX_BODY_BYTES = 64 * 1024;
/** Server-stamped keys the browser may never set. */
const RESERVED = new Set(['app', 'env', 'release', 'ts', 'request_id', 'ip']);

const isPrimitive = (v: unknown): v is LogPrimitive =>
  v == null || ['string', 'number', 'boolean'].includes(typeof v);

const isLevel = (v: unknown): v is LogLevel =>
  typeof v === 'string' && LEVELS.includes(v as LogLevel);

/** Validates one browser-submitted entry; returns null when it must be rejected. */
export function sanitizeEntry(
  raw: unknown,
  stamp: {
    app: LogApp;
    env: string;
    release: string;
    ip?: string;
    request_id?: string;
  }
): LogEntry | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const { event, action, level } = obj;
  if (typeof event !== 'string' || !NAME_RE.test(event)) return null;
  if (typeof action !== 'string' || !NAME_RE.test(action)) return null;
  if (!isLevel(level)) return null;

  const details: Record<string, LogPrimitive> = {};
  let keys = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (RESERVED.has(key) || ['event', 'action', 'level'].includes(key))
      continue;
    if (!isPrimitive(value)) return null;
    if (++keys > MAX_KEYS) return null;
    details[key] =
      typeof value === 'string' ? value.slice(0, MAX_STRING) : value;
  }
  return {
    ...details,
    ...stamp,
    ts: new Date().toISOString(),
    level,
    event,
    action
  };
}

export interface LogRouteInput {
  body: unknown;
  ip?: string;
  request_id?: string;
}

/** Shared handler body for POST /api/log — framework-free so it is unit-testable. */
export function ingestLogBatch(
  input: LogRouteInput,
  sink: LogSink,
  stamp: { app: LogApp; env: string; release: string }
): { accepted: number } {
  const entries =
    input.body && typeof input.body === 'object'
      ? (input.body as { entries?: unknown }).entries
      : undefined;
  if (!Array.isArray(entries) || entries.length > MAX_ENTRIES)
    return { accepted: 0 };
  let accepted = 0;
  for (const raw of entries) {
    const entry = sanitizeEntry(raw, {
      ...stamp,
      ip: input.ip,
      request_id: input.request_id
    });
    if (!entry) continue;
    sink(entry);
    accepted += 1;
  }
  return { accepted };
}
