/**
 * Canonical structured logger — semantically IDENTICAL across Backend,
 * AdminPanel, edusphere. Zero dependencies, Node + browser. When you change
 * this file, mirror the change into the other two copies; only the per-app
 * `app-logger.ts` differs.
 *
 * One flat JSON line per call: envelope (ts/level/app/env/release/event/action)
 * + auto-injected context (request_id/academy_id/user_id/role) + flat details.
 * Loki indexes app/env/level/event/action as labels; everything else is `| json`.
 */
import { flattenFields } from './flatten-fields';
import { consoleSink } from './sinks';

export type LogApp = 'backend' | 'panel' | 'website';
export type LogLevel = 'info' | 'warn' | 'error';

export type LogPrimitive = string | number | boolean | null | undefined;
export type LogFields = Record<string, LogPrimitive>;

export interface LogEntry extends LogFields {
  ts: string;
  level: LogLevel;
  app: LogApp;
  env: string;
  release: string;
  event: string;
  action: string;
}

export type LogSink = (entry: LogEntry) => void;

export interface LoggerConfig<C extends LogCatalog> {
  catalog: C;
  app: LogApp;
  env?: string;
  release?: string;
  /** Fields merged into every entry (request_id, academy_id, …). */
  getContext?: () => LogFields;
  sink?: LogSink;
}

export interface LogEventDef {
  readonly description: string;
  readonly level: LogLevel;
  readonly fields: readonly string[];
}

export interface LogDomainDef {
  readonly description: string;
  readonly actions: Readonly<Record<string, LogEventDef>>;
}

export type LogCatalog = Readonly<Record<string, LogDomainDef>>;

export type LogDomain<C extends LogCatalog> = Extract<keyof C, string>;

export type LogAction<C extends LogCatalog, E extends LogDomain<C>> = Extract<
  keyof C[E]['actions'],
  string
>;

export type ContextField = 'request_id' | 'academy_id' | 'user_id' | 'role';
export type ErrorField =
  | 'error_name'
  | 'error_message'
  | 'error_code'
  | 'error_stack';

/** Declared catalog fields plus the always-allowed context and error keys. */
export type LogDetails<
  C extends LogCatalog,
  E extends LogDomain<C>,
  A extends LogAction<C, E>
> = Partial<
  Record<
    | (C[E]['actions'][A] extends LogEventDef
        ? C[E]['actions'][A]['fields'][number]
        : never)
    | ContextField
    | ErrorField,
    LogPrimitive
  >
>;

export interface LogCatalogEntry extends LogEventDef {
  readonly event: string;
  readonly action: string;
  readonly domainDescription: string;
}

export function listLogCatalog(catalog: LogCatalog): LogCatalogEntry[] {
  const rows: LogCatalogEntry[] = [];
  for (const [event, domain] of Object.entries(catalog)) {
    for (const [action, def] of Object.entries(domain.actions)) {
      rows.push({
        ...def,
        event,
        action,
        domainDescription: domain.description
      });
    }
  }
  return rows;
}

/** PascalCase enforced by the compiler: snake_case or camelCase → never. */
type UpperAlpha =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

export type PascalCase<S extends string> = S extends `${UpperAlpha}${string}`
  ? S extends `${string}_${string}`
    ? never
    : S
  : never;

export interface Logger<C extends LogCatalog> {
  /** General form; `level` defaults to the catalog entry's level. */
  event<E extends LogDomain<C>, A extends LogAction<C, E>>(
    event: E,
    action: A,
    details?: LogDetails<C, E, A> & { level?: LogLevel }
  ): void;
  ok<E extends LogDomain<C>, A extends LogAction<C, E>>(
    event: E,
    action: A,
    details?: LogDetails<C, E, A>
  ): void;
  warn<E extends LogDomain<C>, A extends LogAction<C, E>>(
    event: E,
    action: A,
    details?: LogDetails<C, E, A>
  ): void;
  error<E extends LogDomain<C>, A extends LogAction<C, E>>(
    event: E,
    action: A,
    details?: LogDetails<C, E, A>
  ): void;
}

function envVar(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env?.[name] : undefined;
}

export function createLogger<C extends LogCatalog>(
  config: LoggerConfig<C>
): Logger<C> {
  const env = config.env ?? envVar('NODE_ENV') ?? 'development';
  const release =
    config.release ??
    envVar('RELEASE') ??
    envVar('NEXT_PUBLIC_RELEASE') ??
    'dev';
  const sink = config.sink ?? consoleSink;
  const getContext = config.getContext ?? (() => ({}));

  const emit = (
    event: string,
    action: string,
    level: LogLevel,
    fields: LogFields
  ): void => {
    const details = flattenFields(fields);
    if (level !== 'error') delete details.error_stack;
    // Envelope keys are written LAST so callers can never overwrite them.
    sink({
      ...getContext(),
      ...details,
      ts: new Date().toISOString(),
      level,
      app: config.app,
      env,
      release,
      event,
      action
    });
  };

  const catalogLevel = (event: string, action: string): LogLevel =>
    config.catalog[event]?.actions[action]?.level ?? 'info';

  return {
    event: (event, action, fields = {}) => {
      const { level = catalogLevel(event, action), ...rest } = fields;
      emit(event, action, level, rest);
    },
    ok: (event, action, fields = {}) => emit(event, action, 'info', fields),
    warn: (event, action, fields = {}) => emit(event, action, 'warn', fields),
    error: (event, action, fields = {}) => emit(event, action, 'error', fields)
  };
}
