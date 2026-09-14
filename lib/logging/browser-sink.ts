import type { LogEntry, LogSink } from './logger';
import { consoleSink } from './sinks';

const FLUSH_MS = 2000;
const MAX_ENTRIES = 50;

/** Batches browser logs to the app's own /api/log route, which forwards to Loki. */
export function createBrowserSink(endpoint = '/api/log'): LogSink {
  let queue: LogEntry[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (useBeacon = false): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!queue.length) return;
    const body = JSON.stringify({ entries: queue });
    const batch = queue;
    queue = [];
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) batch.forEach(consoleSink);
      })
      .catch(() => batch.forEach(consoleSink));
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => flush(true));
  }

  return (entry) => {
    queue.push(entry);
    if (queue.length >= MAX_ENTRIES) flush();
    else if (!timer) timer = setTimeout(() => flush(), FLUSH_MS);
  };
}
