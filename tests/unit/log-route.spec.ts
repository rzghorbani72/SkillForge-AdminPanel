import { expect, test } from '@playwright/test';
import { ingestLogBatch, sanitizeEntry } from '@/lib/logging/log-route';
import type { LogEntry } from '@/lib/logging/logger';

const stamp = { app: 'panel' as const, env: 'test', release: 'r1' };

test('accepts a valid flat entry and re-stamps server fields', () => {
  const entry = sanitizeEntry(
    {
      event: 'Checkout',
      action: 'RedirectFailed',
      level: 'error',
      plan_slug: 'growth',
      app: 'backend',
      ts: 'x',
    },
    { ...stamp, ip: '1.2.3.4' },
  );
  expect(entry).toMatchObject({
    app: 'panel',
    env: 'test',
    release: 'r1',
    ip: '1.2.3.4',
    plan_slug: 'growth',
  });
  expect(entry?.ts).not.toBe('x');
});

test('rejects bad names, levels and nested values', () => {
  expect(sanitizeEntry({ event: 'checkout', action: 'X', level: 'info' }, stamp)).toBeNull();
  expect(sanitizeEntry({ event: 'Checkout', action: 'failed_x', level: 'info' }, stamp)).toBeNull();
  expect(sanitizeEntry({ event: 'Checkout', action: 'Failed', level: 'debug' }, stamp)).toBeNull();
  expect(
    sanitizeEntry({ event: 'Checkout', action: 'Failed', level: 'info', meta: { a: 1 } }, stamp),
  ).toBeNull();
});

test('ingests only the valid entries of a batch and caps batch size', () => {
  const seen: LogEntry[] = [];
  const sink = (e: LogEntry) => seen.push(e);
  const good = { event: 'Checkout', action: 'Failed', level: 'warn' };
  expect(ingestLogBatch({ body: { entries: [good, { nope: 1 }, good] } }, sink, stamp)).toEqual({
    accepted: 2,
  });
  expect(seen).toHaveLength(2);
  expect(ingestLogBatch({ body: { entries: Array(51).fill(good) } }, sink, stamp)).toEqual({
    accepted: 0,
  });
});
