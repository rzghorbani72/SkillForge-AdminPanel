# AdminPanel E2E (Playwright)

UI tests for the auth/account flows (checklist 5.1). Mirrors the backend's
`Backend/test/auth.e2e-spec.ts` at the browser level.

## Routes under test

- `/login` — MANAGER / TEACHER login (phone + password → staff login)
- `/register` — standalone MANAGER sign-up (details → phone OTP)
- (`/admin-login` is for ADMIN / SUPPORT — separate flow)

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
