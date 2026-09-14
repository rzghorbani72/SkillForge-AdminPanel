# AdminPanel — Project Rules

This repo is the **academy manager / teacher / platform-owner panel** of **Mentoma**, an Academy Operating System for MENA academies.
Sibling repos (separate git, expected next to this folder): `../Backend` (NestJS API, the only source of truth) and `../edusphere` (public academy sites).

## Read first

1. `docs/project-context.md` — what we build, the business model, how to act (challenging co-founder, not agreeable assistant).
2. `docs/business/mentoma-strategy-and-positioning.md` — positioning, moat, execution pillars.
3. `docs/ONBOARDING.md` — stack, setup, commands, folder map. `docs/ARCHITECTURE.md` — diagrams and flows.
4. Pick the matching skill in `.claude/skills/` before starting a task.

## Strategic guardrails

- Mentoma is an **Academy Operating System**, not an LMS. Buyer = academy **manager**. Operations before content-creation features.
- Iran is the beachhead (fa/RTL first), not the destination. Keep UI logic locale-agnostic: every string goes through i18n, every number through the shared formatter.
- **The moat is the learning record.** Screens that show or edit grades, submissions, feedback, or attendance must never lose user input silently.

## Execution pillars (zero-defect bar when touched)

1. **Multi-tenant isolation** — never trust the UI for tenant scope; the Backend enforces it. Never mix data of two academies in client state.
2. **Learning-record durability** — save drafts, confirm destructive actions, surface save failures.
3. **Money movement** — checkout/payment screens show exact amounts and states; no double-submit.
4. **Access control** — route guards in `proxy.ts` are UX only; the server decides. Hide what a role cannot do, but never rely on hiding.
5. **Reliability & observability** — structured logs for meaningful flows; graceful error states.
6. **Time-to-value** — a non-technical manager must succeed alone: guided empty states, plain Persian copy.

Everywhere else: simple and "good enough".

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui + Radix · pnpm · Playwright · Loki/Grafana logging · Sentry. Runs on port 4000.

## Coding standards

- Always tell me the commit message when a change is finished. Commits are brief.
- Speak English. Explain in simple, plain words. Teach the way of thinking in **bold**.
- Simplest, minimum change. No over-engineering. Remove redundant code and abstractions.
- Functional components + hooks. Server components by default; `"use client"` only at the leaves that need it. State: zustand (`lib/store.ts`) + react-query.
- Use `components/ui` (shadcn) primitives — never hand-roll dropdowns, dialogs, popovers.
- RTL-safe: logical positioning (`start`/`end`, `ms-`/`me-`), never `left`/`right`. No `font-mono` on Persian digits.
- **Never hardcode user-facing strings** — use the i18n translation keys (`fa` first). Never show raw ids to users.
- Ids are **cuid strings** — never `parseInt`/`Number()` on an id.
- Lists: more than 4 records = table, 4 or fewer = cards. Dialogs never scroll — widen and use a 2-column grid.
- **Files: warn at 200 lines, error at 400** (ESLint `max-lines`). Split: `page.tsx` thin → `_components/`, `_hooks/use-*.ts`, `_lib/`. Legacy oversize files are listed in `eslint.oversize.mjs`; that list may only shrink.
- Comments: as few and short as possible; only for genuinely non-obvious "why". Delete restating/section-header comments in any file you touch.
- Memoize only after measuring. Docs live in `docs/`; README.md is only for startup.

## TypeScript rules

- `strict: true`. Never `any` — use `unknown` and narrow.
- No `as` casts except safe, already-checked narrowing. No non-null assertion `x!`. No `@ts-ignore`.
- Prefer `type`/`interface`, discriminated unions, `readonly`, `as const`. Avoid `enum`.
- `?.` and `??` for null handling; `==` only as `== null`.
- Derive types from one source (API types, `Pick`, `Omit`, `ReturnType`). No unused vars/imports; prefix intentionally unused with `_`.

## Logging (Loki/Grafana)

- Only `import { logger } from '@/lib/logging/app-logger'` (`app: 'panel'`). Never `console.*`, never interpolated messages.
- Shape: `logger.event(Event, Action, flatDetails)` or `logger.ok|warn|error(...)`. Event/Action are PascalCase domain names, never messages or ids.
- Browser logs post to `app/api/log/route.ts`, which forwards to Loki. Context comes from `setLogContext()`.
- Every `(event, action)` must exist in `lib/logging/log-catalog.ts`: run `pnpm log:catalog` (needs `../Backend` checked out) after adding a log.
- The logging core files are mirrored from `../Backend/src/common/logging` — keep them semantically identical.

## Docs must stay current

When you add/remove a route group, change `proxy.ts`, change the API client layout, or change auth/tenant handling, update `docs/ARCHITECTURE.md` (see its owner map) and `docs/ONBOARDING.md` in the same commit.

## Skills in this repo

`react-nextjs-expert`, `pixel-perfect-design-implement`, `ui-ux-designer`, `seo-marketing-expert`, `client-browser-performance-expert`, `react-feature`, `structured-logging`, `commit-summary`, `founder-coach`.
