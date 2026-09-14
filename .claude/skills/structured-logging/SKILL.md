---
name: structured-logging
description: Add or audit Loki/Grafana-ready structured logs in this app. Use whenever adding a log line, instrumenting a job/flow, or reviewing logs for the strict (app, event, action, level, flat-fields) convention. Enforces the shared logger over console/NestJS Logger/interpolated strings and keeps the shared logging core mirrored with the sibling repos.
---

# Structured Logging

Logs are pushed to Loki and charted/alerted in Grafana. Every log is ONE flat
JSON line with the same shape in dev (stdout) and prod (Loki).

## The one line shape

```json
{"ts":"…","level":"info","app":"backend","env":"production","release":"a1b2c3d",
 "event":"Payments","action":"Verified",
 "request_id":"…","academy_id":"…","user_id":"…","role":"student",
 "payment_id":"…","amount_toman":650000,"gateway":"saman"}
```

- Envelope (logger sets, callers cannot overwrite): `ts`, `level` (`info|warn|error`), `app`, `env`, `release`, `event`, `action`.
- Context (auto-injected): `request_id`, `academy_id`, `user_id`, `role`. Backend reads the CLS store; browsers read `setLogContext()`. Pass `academy_id`/`user_id` by hand only where no request exists (jobs, CLI).
- Details: flat primitives declared in the catalog. Errors ONLY via `errorFields(err)`.
- Loki labels: `app`, `env`, `level`, `event`, `action`. Everything else is `| json`.

## The rules that break Grafana

NEVER:
```ts
console.log(`Storage drift: ${JSON.stringify(x)}`)
this.logger.error('Failed to upload', error)        // NestJS Logger
logger.error('Failed to upload ' + key, …)          // message as a name
logger.ok('Storage', 'Drift', { report })            // nested object
```
ALWAYS:
```ts
logger.ok('Storage', 'ReconciliationCompleted', { academy_id, drift_bytes, files })
logger.error('Media', 'ImageUploadFailed', { key, ...errorFields(error) })
```

## Import

`import { logger } from '@/lib/logging/app-logger'` and `import { errorFields } from '@/lib/logging/error-fields'`.
Browser logs post to `app/api/log/route.ts`, which validates and forwards to Loki.

## Call shape

```ts
logger.event(event, action, details)   // level from the catalog; override with { level }
logger.ok(event, action, details)      // level: info
logger.warn(event, action, details)
logger.error(event, action, details)
```

## Hard constraints

1. NEVER interpolate variables into `event` or `action` — one `(event, action)` = one chart. A ternary between two literals is fine; a template string is not.
2. A message is never a name: `logger.error('Bootstrap','StartupFailed', errorFields(err))`.
3. A helper forwarding a name must accept `PascalCase<A>` / `LogAction<…>`, not `string`.
4. `details` are FLAT primitives, snake_case. The type rejects objects; the runtime flattens one level as a safety net — do not rely on it.
5. Never log PII (emails, phones, raw URLs with tokens, signed URLs). Log ids, hashes, counts, kinds.
6. Delete noise: config echo at startup, step-by-step progress, per-request "success" lines (`Http.RequestCompleted` already covers every request).
7. Background jobs MUST emit a heartbeat on every run (Grafana alerts on `absent_over_time`).
8. Transports only via `createLogger`'s `sink`. `LOKI_URL` set → Loki; unset → stdout.

## Shared core

`logger.ts`, `loki-sink.ts`, `sinks.ts`, `flatten-fields.ts`, `error-fields.ts`
live in `lib/logging/` here and in `../Backend/src/common/logging/` and the other
frontend's `lib/logging/`. Keep them SEMANTICALLY identical; mirror every change
(Prettier may reformat). Only `app-logger.ts` differs.

## The catalog

Each app owns a generated `logging/log-catalog.ts` (one entry per `(event,
action)` with `description`, `level`, `fields`). The logger is typed against it:
unknown event/action or undeclared field = compile error.

Workflow for a new log:
1. Write the call site: `logger.ok('Storage', 'OrphanDeleted', { academy_id, files })`.
2. `pnpm log:catalog` — runs `../Backend/tools/build-log-catalog.mjs` (the sibling Backend checkout is required) and regenerates this app's `lib/logging/log-catalog.ts`.
3. Replace the derived description in `log-catalog.descriptions.json` (the only hand-edited file).

Computed action names (`logger.ok('Support', action, …)`) must be declared in
`log-catalog.extra.json`; type the parameter as `LogAction<AppLogCatalog, 'Support'>`.

## CI

`pnpm log:catalog:check` fails when the catalog is stale. ESLint `no-console`
blocks `console.*`.

## Grafana quick queries

- One series: `{app="backend", event="Payments", action="Verified"}`
- One request: `{app=~"backend|panel"} | json | request_id="…"`
- One tenant's errors: `{level="error"} | json | academy_id="…"`
- Heartbeat alert: `absent_over_time({event="TokenCleanup", action="FullCompleted"}[26h])`
