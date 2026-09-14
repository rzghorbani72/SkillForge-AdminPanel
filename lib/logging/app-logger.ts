import { createLogger, type LogSink } from './logger';
import { LOG_CATALOG } from './log-catalog';
import { createLokiSink } from './loki-sink';
import { consoleSink, teeSinks } from './sinks';
import { createBrowserSink } from './browser-sink';
import { getBrowserContext } from './browser-context';

const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

const lokiUrl = process.env.LOKI_URL;
/** Server-side Loki sink; also used by the /api/log route for browser batches. */
export const lokiSink =
  !isBrowser && lokiUrl
    ? createLokiSink({
        url: lokiUrl,
        user: process.env.LOKI_USER,
        token: process.env.LOKI_TOKEN,
      })
    : null;

function resolveSink(): LogSink {
  if (isBrowser) {
    const remote = createBrowserSink();
    return isProduction ? remote : teeSinks(consoleSink, remote);
  }
  if (!lokiSink) return consoleSink;
  return isProduction ? lokiSink : teeSinks(consoleSink, lokiSink);
}

/** Panel-wide structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({
  app: 'panel',
  catalog: LOG_CATALOG,
  release: process.env.NEXT_PUBLIC_RELEASE,
  getContext: isBrowser ? getBrowserContext : undefined,
  sink: resolveSink(),
});
