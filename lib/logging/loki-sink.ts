import type { LogEntry, LogSink } from './logger';
import { consoleSink } from './sinks';

export interface LokiSinkOptions {
  url: string;
  user?: string;
  token?: string;
  /** Receives the batch when Loki is unreachable; defaults to console. */
  fallback?: LogSink;
  flushMs?: number;
  maxEntries?: number;
  maxBytes?: number;
  maxQueue?: number;
}

export interface LokiSink extends LogSink {
  flush(): Promise<void>;
}

const LABELS = ['app', 'env', 'level', 'event', 'action'] as const;

interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

const nanoTs = (iso: string): string => `${Date.parse(iso)}000000`;

function toStreams(entries: LogEntry[]): LokiStream[] {
  const byKey = new Map<string, LokiStream>();
  for (const entry of entries) {
    const stream = Object.fromEntries(LABELS.map((l) => [l, String(entry[l])]));
    const key = LABELS.map((l) => stream[l]).join('|');
    const existing = byKey.get(key) ?? { stream, values: [] };
    existing.values.push([nanoTs(entry.ts), JSON.stringify(entry)]);
    byKey.set(key, existing);
  }
  return Array.from(byKey.values());
}

/**
 * Batches entries and pushes them to Loki over HTTP. Best-effort by design:
 * on any failure the batch goes to `fallback` and is dropped — logging can
 * never block or crash the app.
 */
export function createLokiSink(options: LokiSinkOptions): LokiSink {
  const {
    url,
    user,
    token,
    fallback = consoleSink,
    flushMs = 2000,
    maxEntries = 100,
    maxBytes = 1_000_000,
    maxQueue = 2000,
  } = options;
  const endpoint = `${url.replace(/\/$/, '')}/loki/api/v1/push`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (user && token) headers.Authorization = `Basic ${btoa(`${user}:${token}`)}`;

  let queue: LogEntry[] = [];
  let queuedBytes = 0;
  let dropped = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const send = async (batch: LogEntry[]): Promise<void> => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ streams: toStreams(batch) }),
        keepalive: true,
      });
      if (!res.ok) throw new Error(`Loki push failed: ${res.status}`);
    } catch {
      batch.forEach(fallback);
    }
  };

  const flush = async (): Promise<void> => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!queue.length) return;
    const batch = queue;
    queue = [];
    queuedBytes = 0;
    if (dropped) {
      const { app, env, release } = batch[batch.length - 1];
      batch.push({
        ts: new Date().toISOString(),
        level: 'warn',
        app,
        env,
        release,
        event: 'Logging',
        action: 'EntriesDropped',
        dropped_count: dropped,
      });
      dropped = 0;
    }
    await send(batch);
  };

  const schedule = (): void => {
    if (timer) return;
    timer = setTimeout(() => void flush(), flushMs);
    timer.unref?.();
  };

  const push = (entry: LogEntry): void => {
    if (queue.length >= maxQueue) {
      queue.shift();
      dropped += 1;
    }
    queue.push(entry);
    queuedBytes += JSON.stringify(entry).length;
    if (queue.length >= maxEntries || queuedBytes >= maxBytes) void flush();
    else schedule();
  };
  return Object.assign(push, { flush });
}
