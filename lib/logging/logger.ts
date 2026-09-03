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

export type LogApp = 'backend' | 'panel' | 'website';
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

export interface LoggerConfig<C extends LogCatalog> {
  /** The catalog of every event this app may emit — see `log-catalog.ts`. */
  catalog: C;
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

/**
 * ── The log catalog ────────────────────────────────────────────────────────
 * Every log this app can emit is declared once, in `log-catalog.ts`. A catalog
 * entry is the contract for one Grafana chart: a stable index name
 * (`category` + `type`), a human description, the expected severity, and the
 * flat detail fields it carries. The logger is typed against the catalog, so an
 * unregistered event, action, or field is a compile error rather than a new
 * shape appearing silently in Elasticsearch.
 */
export interface LogEventDef {
  /** What happened and why someone would chart it. */
  readonly description: string;
  /** The severity this event is normally emitted at. */
  readonly status: LogStatus;
  /** Flat detail keys this event carries. Nothing else may be logged. */
  readonly fields: readonly string[];
}

export interface LogDomainDef {
  /** What this domain covers, e.g. "File storage quota and reconciliation". */
  readonly description: string;
  readonly actions: Readonly<Record<string, LogEventDef>>;
}

export type LogCatalog = Readonly<Record<string, LogDomainDef>>;

/** Domain names available in a catalog. */
export type LogDomain<C extends LogCatalog> = Extract<keyof C, string>;

/** Action names available under one domain. */
export type LogAction<C extends LogCatalog, E extends LogDomain<C>> = Extract<
  keyof C[E]['actions'],
  string
>;

/** The detail object one catalogued event accepts — declared fields only. */
export type LogDetails<
  C extends LogCatalog,
  E extends LogDomain<C>,
  A extends LogAction<C, E>
> = Partial<
  Record<
    C[E]['actions'][A] extends LogEventDef
      ? C[E]['actions'][A]['fields'][number]
      : never,
    string | number | boolean | null | undefined
  >
>;

/** One flattened catalog row — used to document or export the log index. */
export interface LogCatalogEntry extends LogEventDef {
  readonly event: string;
  readonly action: string;
  readonly domainDescription: string;
}

/** Flattens a catalog into rows, e.g. to generate Grafana/ES documentation. */
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

/**
 * Event and action names are PascalCase, enforced by the compiler: a
 * snake_case or camelCase name resolves to `never` and fails the build, so the
 * Grafana filter keys can never drift back to mixed conventions.
 */
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
  /** General form; `status` defaults to the catalog entry's status. */
  event<E extends LogDomain<C>, A extends LogAction<C, E>>(
    event: E,
    action: A,
    details?: LogDetails<C, E, A> & { status?: LogStatus }
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

export function createLogger<C extends LogCatalog>(
  config: LoggerConfig<C>
): Logger<C> {
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

  const catalogStatus = (category: string, type: string): LogStatus =>
    config.catalog[category]?.actions[type]?.status ?? 'ok';

  return {
    event: (category, type, fields = {}) => {
      const { status = catalogStatus(category, type), ...rest } = fields;
      emit(category, type, status, rest);
    },
    ok: (category, type, fields = {}) => emit(category, type, 'ok', fields),
    warn: (category, type, fields = {}) => emit(category, type, 'warn', fields),
    error: (category, type, fields = {}) =>
      emit(category, type, 'error', fields)
  };
}
