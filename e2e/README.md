# AdminPanel E2E (Playwright)

UI tests for the auth/account flows (checklist 5.1). Mirrors the backend's
`Backend/test/auth.e2e-spec.ts` at the browser level.

## Layout

- `e2e/auth/` — login/register form validation + happy-path login (`@backend`).
  The auth pages use the redesigned `<AuthField>`/`<AuthSubmit>` components, so
  specs select `input[type="tel"]` / `input[type="password"]` and assert the
  `has-error` class (not legacy ids / `border-destructive`).
- `e2e/smoke/` — **no backend needed**, all green in CI/dev:
  - `security-headers.spec.ts` — CSP (the panel had none before) + `X-Frame-Options: DENY` + nosniff (OWASP A05).
  - `public-pages.spec.ts` — `/login`, `/admin-login`, `/register`, `/unauthorized`, 404 all render (no crash).
  - `auth-guard.spec.ts` — **hacker**: every protected route (`/dashboard`, `/students`, `/platform/*`, …) bounces to `/login` when unauthenticated.
- `e2e/roles/` — `@backend` role matrix: MANAGER / TEACHER / ADMIN journeys **plus the privilege-escalation hacker path** (a MANAGER/TEACHER cannot open ADMIN-only `/platform/*` by URL).

## What runs without a backend

The **validation** specs (`*— validation (no backend)`) only need the AdminPanel
dev server; Playwright starts it automatically (`webServer` in
`playwright.config.ts`). They assert client-side form validation:

```bash
pnpm test:e2e            # runs validation specs (auto-starts next dev on :4000)
pnpm test:e2e:ui         # interactive UI mode
```

First time only, install the browser:

```bash
pnpm exec playwright install chromium
```

## Backend-dependent specs (`@backend`)

Happy-path login/register hit the real API and are skipped unless `E2E_BACKEND=1`.
They need:

1. Backend running on `:3000` with seeded roles (`pnpm --dir ../Backend prisma db seed`)
2. A seeded MANAGER (phone + password) in an academy
3. AdminPanel pointed at the API — set `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
   in `.env.local` (or rely on the same-origin `/api` rewrite).

```bash
E2E_BACKEND=1 \
E2E_MANAGER_PHONE=09120000000 \
E2E_MANAGER_PASSWORD='Passw0rd!' \
pnpm test:e2e
```
