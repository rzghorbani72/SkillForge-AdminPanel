---
name: react-nextjs-expert
description: Use when adding a route, page, component, hook, or API call in this repo, or asked how server/client boundaries, proxy.ts, or the data layer work here. Not for visual polish -- use pixel-perfect-design-implement for that.
---

# React / Next.js Expert — AdminPanel

Next.js 16 App Router, React 19, TypeScript (`strict: true`), Tailwind v4, shadcn/ui + Radix. This is the academy manager / teacher / platform-owner dashboard, port 4000. Sibling repos: `../Backend` (API), `../edusphere` (public site).

## Route groups

`app/(auth)/` — login, admin-login, register, forget-password, select-school (unauthenticated).
`app/(protected)/<domain>/page.tsx` — one folder per domain (courses, students, financial, platform/*, website, tutoring, support…), auth-gated by `proxy.ts`.
`app/api/` — `auth/[...nextauth]`, `geolocation`, `log` (browser-log forwarder to Loki).

## proxy.ts (this app's `middleware.ts`, Next 16 naming)

Order: `enforceTrustedHost → enforceApiRateLimit → enforceApiOriginCsrf` (`lib/security/request-guards.ts`) → `handlePageAuth`: verifies the `jwt` cookie (jose, HS256), resolves role via `lib/auth-routing.ts` (`resolveSessionRole`, `homeRouteFor`, `canOpenRoute`), redirects unauthenticated → `/login?redirect=`, wrong-role → their own home. **This is UX routing only** — the Backend enforces access for real; never treat a `proxy.ts` pass as authorization.

## Server vs. client boundary

Server components by default. `'use client'` only at the leaf that needs state, effects, or a browser API — not at a whole page just because one child needs it. Extract the interactive piece into its own client component and keep the page server-rendered around it.

## Data layer

- `lib/api.ts` (re-exports `lib/api/index.ts` if split — check current state) is the one API client, `apiClient`, imported by nearly every page. Add a new endpoint next to its domain group, don't inline `fetch()`.
- Browser calls go **same-origin** to `/{lang}/v1/...` (`getBrowserApiBaseUrl`), so the `jwt`/`refresh_token` HttpOnly cookies stick to the panel's own host; Next rewrites `/v1` to the Backend (`BACKEND_API_URL`/`NEXT_PUBLIC_BACKEND_API_URL`, `next.config.ts`). Never call the Backend origin directly from client code.
- Auth: HttpOnly cookies only, `credentials: 'include'`, no Authorization header. A 401 triggers a single-flight `/auth/refresh` then retry; still-401 redirects to login.
- CSRF: double-submit `csrf-token` cookie → `X-CSRF-Token` header (`lib/csrf.ts`).
- Tenant: the selected academy id lives in `localStorage['skillforge_selected_academy_id']`, sent as `X-Academy-ID` via `selectedAcademyHeader()` (`lib/browser-request-headers.ts`) — a platform staff (ADMIN/SUPPORT) token is academy-less until this header scopes it.
- More detail: `docs/frontend-data-layer.md`.

## State

- `zustand` (`lib/store.ts`, often `persist`-backed) for client-side UI/session state.
- `@tanstack/react-query` (`components/providers/query-provider.tsx`) for server-state caching — a 4xx is treated as a verdict, not retried (fights the refresh/plan-gating logic already in `ApiClient.request()`). Query keys: `lib/query/keys.ts`.
- Don't duplicate the same server data in both a zustand store and a query cache — pick one per piece of state.

## Forms & dialogs

See `docs/frontend-dialog-actions.md` for the confirm/async-outcome pattern. Dialogs never scroll — widen and use a 2-column grid instead (memory `dialog-no-scroll-rule`). Step through every async outcome (loading, success, error, permission-denied) explicitly, don't just handle the happy path.

## i18n

Custom system, `lib/i18n/` (`config.ts`, DEFAULT_LANGUAGE = `fa`, RTL support; `translations/{fa,en,ar,tr}.ts`). Never hardcode a user-facing string — add a translation key. `fa` renders RTL: use logical CSS (`start`/`end`, `ms-`/`me-`), never `left`/`right`.

## Reuse before creating

Check `components/<domain>/` and `hooks/` for an existing component/hook before adding one — this app has ~50 domain component folders and duplication creeps in fast. `components/ui/` is shadcn — never hand-roll a dropdown/dialog/popover (see `prefer-shadcn-primitives`).

## The 400-line / component-size rule

`page.tsx` stays thin (data fetch + layout); extract UI into `_components/`, state into `_hooks/use-*.ts`, pure logic into `_lib/`. ESLint `max-lines` errors at 400 — `eslint.oversize.mjs`'s `OVERSIZE_ALLOWLIST` lists the current legacy offenders (`lib/api.ts`, several `page.tsx` files); that list may only shrink.

## Commands

`pnpm dev` (port 4000) · `pnpm build` · `pnpm test:unit` · `pnpm test:e2e` (Playwright, needs Backend running) · `pnpm lint` · `pnpm typecheck`.
