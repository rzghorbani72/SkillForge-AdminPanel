---
name: react-feature
description: Scaffold a React/Next.js feature (component, page, hook, or API call) in this repo following this project's App Router + best-practice architecture. Use when adding frontend UI, a route, or data-fetching for the academy panel or the public website.
---

# React / Next.js Feature

This repo is the academy manager / teacher / platform-owner panel (`app: 'panel'`): Next.js App Router + React 19 + TypeScript + Tailwind v4 + shadcn/ui.

## Where things go

```
app/...                  # App Router routes (route groups like (auth), (protected))
components/<domain>/     # feature components, grouped by domain
hooks/                   # reusable hooks (use<Thing>.ts)
lib/api/                 # API clients / fetchers
lib/...                  # shared utils (kebab-case files)
```

## Rules (this repo)

- Strict TypeScript — NEVER `any`. Type props and API responses explicitly.
- Functional components with hooks only.
- Naming: Components PascalCase; component files kebab-case
  (`course-list.tsx`); variables camelCase; constants UPPER_SNAKE_CASE.
- Server Components by default; add `'use client'` only when you need state,
  effects, or browser APIs.
- Tailwind for styling — match existing utility patterns, no ad-hoc CSS files.
- async/await for data fetching, never `.then()` chains. Reuse `lib/api`
  clients instead of inlining `fetch`.
- Reuse before creating: check `components/<domain>` and `hooks/` for an existing
  component/hook before adding a new one. Extract shared UI into reusable pieces.
- Memoize expensive computations (`useMemo`/`useCallback`) and proper error
  handling on every data path.
- Multi-tenant/white-label: never hardcode academy branding, currency, or
  locale — read from the academy/theme context. v1 ships Persian (`fa`) RTL for
  Iran; keep components locale- and direction-safe.
- Add structured logs for meaningful client events via the shared logger
  (`@/lib/logging/app-logger`) — see the structured-logging skill.

## Steps

1. Decide whether it's a route, a component, a hook, or an API call.
2. Check for an existing component/hook to extend before creating new.
3. Scaffold with the layout + naming above; type all props and responses.
4. Keep it minimal — straightforward over clever, no over-engineering.
5. Report the brief commit message (per commit-summary skill).
