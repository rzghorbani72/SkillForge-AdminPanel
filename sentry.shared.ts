/** Sentry options shared by the client, server and edge runtimes. Off unless a DSN is set. */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryBaseOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_RELEASE,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  sendDefaultPii: false,
};
