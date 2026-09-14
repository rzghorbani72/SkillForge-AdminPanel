# Onboarding — AdminPanel

## What this app is

The academy manager / teacher / platform-owner dashboard for **Mentoma** (see `docs/project-context.md` and `docs/business/mentoma-strategy-and-positioning.md` for business context). Runs on **port 4000**.

Sibling repos (separate git checkouts, expected as `../Backend` and `../edusphere`):
- **Backend** — the API and only source of truth for data, port 3000.
- **edusphere** — the public storefront, port 5000.

## Stack & versions

Next.js 16 (App Router), React 19, TypeScript (`strict: true`), Tailwind v4, shadcn/ui + Radix, zustand + `@tanstack/react-query`, pnpm, Playwright, ESLint 9 flat config + Prettier, Loki/Grafana structured logging (browser → `/api/log`), Sentry.

## Setup

1. `pnpm install`
2. Copy `docs/deploy/panel-academy.env.example` → `.env.local` and fill in `BACKEND_API_URL` (points at a running Backend, typically `http://localhost:3000`) and any auth/CSRF secrets that match the Backend's config.
3. Have `../Backend` running (`pnpm dev` there) — this app has no data of its own.
4. `pnpm dev` — starts on port 4000.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server, port 4000, Turbopack |
| `pnpm build` | Production build |
| `pnpm test:unit` | Playwright unit-style tests (`tests/unit`) |
| `pnpm test:e2e` | Playwright e2e (needs Backend running) |
| `pnpm lint` | ESLint + the oversize/legacy-any allowlist check |
| `pnpm format` | Prettier write |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm log:catalog` | Regenerate this app's log catalog (runs `../Backend/tools/build-log-catalog.mjs` — needs the sibling Backend checkout) |

## Folder map

```
app/(auth)/                Unauthenticated: login, admin-login, register, forget-password, select-school.
app/(protected)/<domain>/  One folder per feature area (courses, students, financial, platform/*, website, tutoring, support…), auth-gated by proxy.ts.
app/api/                    auth/[...nextauth], geolocation, log (browser-log forwarder).
components/<domain>/        Feature components, grouped by domain (~50 folders).
components/ui/               shadcn primitives — never hand-roll a dropdown/dialog/popover.
lib/                          API client, i18n, auth routing, stores, security helpers.
hooks/                        Reusable hooks.
sections/                     Older section-based page composition (some routes still use this).
proxy.ts                      This app's middleware.ts (Next 16 naming) — auth/tenant routing.
docs/                         This documentation.
```

## How a request flows

Full diagram in `ARCHITECTURE.md`. Short version: `proxy.ts` checks the `jwt` cookie and role before a protected page renders (UX routing only) → the page (often a Server Component) or a client component calls `lib/api.ts`'s `apiClient` → same-origin `/v1` → Next rewrites to the Backend → HttpOnly cookies carry auth automatically.

## Where to look for X

| Need | Look here |
|---|---|
| Any API call | `lib/api.ts` (`apiClient`) — check before writing a new `fetch()` |
| Auth / session / role routing | `lib/auth-routing.ts`, `proxy.ts` |
| Selected academy / tenant header | `lib/browser-request-headers.ts` (`selectedAcademyHeader`, reads `localStorage['skillforge_selected_academy_id']`) |
| i18n / translations | `lib/i18n/` (`translations/{fa,en,ar,tr}.ts`) |
| Client-side state | `lib/store.ts` (zustand) vs `@tanstack/react-query` (server-state cache) — see `react-nextjs-expert` skill for which to use |
| Structured logging | `lib/logging/` — see `structured-logging` skill |
| Dialog/async-action pattern | `docs/frontend-dialog-actions.md` |
| Data-fetching pattern | `docs/frontend-data-layer.md` |
| UI template / site builder | `components/ui-template/`, `docs/ui/ui-template-architecture.md` |

## Gotchas

- **`proxy.ts`, not `middleware.ts`** — Next 16 naming; it's UX routing only, the Backend is the real authorization boundary.
- **Same-origin API calls** — browser calls go to `/{lang}/v1/...` on this app's own host (cookies stick to the panel domain), never directly to the Backend origin from client code.
- **Ids are cuid strings** — `parseInt()`/`Number()` on an id has silently broken academy selection and login before (memory: `frontend-cuid-as-number-bug`).
- **400-line file limit** — legacy oversize files tracked in `eslint.oversize.mjs`'s `OVERSIZE_ALLOWLIST`; that list may only shrink.
- **RTL** — `fa` is default and renders right-to-left; use logical CSS (`start`/`end`), not `left`/`right`. Radix `side` props aren't RTL-aware by default.
- **Dialogs never scroll** — widen + 2-column grid instead (`docs/frontend-dialog-actions.md`).
- **Lists** — more than 4 records = table, 4 or fewer = cards (`components/shared/data-list`).

## Testing

`pnpm test:e2e` needs the Backend running against a real (ideally disposable/test) database — it exercises real login/role flows. `pnpm test:unit` doesn't need the Backend.
