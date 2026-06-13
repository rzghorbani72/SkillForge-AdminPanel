/**
 * Canonical structured logger — IDENTICAL across Backend, AdminPanel, edusphere.
 * Zero dependencies, framework-agnostic (Node + browser). Do not edit one copy
 * in isolation: keep all three byte-identical. Only the per-app `app-logger.ts`
 * instance differs.
 *
 * Emits one flat JSON line per call so Elasticsearch indexes every field and
 * Grafana can filter/chart by app + category + type. See the Logging rule in
 * CLAUDE.md.
 */

export type LogApp = 'backend' | 'panel' | 'edusphere';
export type LogStatus = 'ok' | 'warn' | 'error';

export type LogFields = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface LogEntry extends LogFields {
  app: LogApp;
  category: string;
  type: string;
  status: LogStatus;
  env: string;
  ts: string;
}

export interface LoggerConfig {
  /** Which application emits the log — the top-level index discriminator. */
  app: LogApp;
  /** Deployment environment; defaults to NODE_ENV or 'development'. */
  env?: string;
  /**
   * Where each entry goes. Defaults to console at the matching level. Override
   * to add an HTTP / Sentry / file transport later WITHOUT touching call sites.
   */
  sink?: (entry: LogEntry) => void;
}

export interface Logger {
  /** General form; `status` defaults to 'ok'. */
  event(
    category: string,
    type: string,
    fields?: LogFields & { status?: LogStatus }
  ): void;
  ok(category: string, type: string, fields?: LogFields): void;
  warn(category: string, type: string, fields?: LogFields): void;
  error(category: string, type: string, fields?: LogFields): void;
}

function resolveEnv(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  return 'development';
}

function defaultSink(entry: LogEntry): void {
  const line = JSON.stringify(entry);
  if (entry.status === 'error') console.error(line);
  else if (entry.status === 'warn') console.warn(line);
  else console.log(line);
}

export function createLogger(config: LoggerConfig): Logger {
  const env = resolveEnv(config.env);
  const sink = config.sink ?? defaultSink;

  const emit = (
    category: string,
    type: string,
    status: LogStatus,
    fields: LogFields
  ): void => {
    // Envelope keys are written LAST so caller fields can never overwrite them.
    sink({
      ...fields,
      app: config.app,
      category,
      type,
      status,
      env,
      ts: new Date().toISOString()
    });
  };

  return {
    event: (category, type, fields = {}) => {
      const { status = 'ok', ...rest } = fields;
      emit(category, type, status, rest);
    },
    ok: (category, type, fields = {}) => emit(category, type, 'ok', fields),
    warn: (category, type, fields = {}) => emit(category, type, 'warn', fields),
    error: (category, type, fields = {}) =>
      emit(category, type, 'error', fields)
  };
}
