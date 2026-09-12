import { NextResponse } from 'next/server';
import { lokiSink } from '@/lib/logging/app-logger';
import { consoleSink } from '@/lib/logging/sinks';
import { ingestLogBatch, MAX_BODY_BYTES } from '@/lib/logging/log-route';
import { trackKey } from '@/lib/request-storm-guard';

const RATE_MAX = 120;
const RATE_WINDOW_MS = 60_000;
const sink = lokiSink ?? consoleSink;

export async function POST(request: Request): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (trackKey(`log:${ip}`, RATE_MAX, RATE_WINDOW_MS).tripped) {
    return new NextResponse(null, { status: 429 });
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES)
    return new NextResponse(null, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  ingestLogBatch(
    { body, ip, request_id: request.headers.get('x-request-id') ?? undefined },
    sink,
    {
      app: 'panel',
      env: process.env.NODE_ENV ?? 'development',
      release: process.env.NEXT_PUBLIC_RELEASE ?? 'dev'
    }
  );
  return new NextResponse(null, { status: 204 });
}
