---
name: ui-ux-designer
description: Use for UX flow decisions, empty/loading/error states, onboarding wizards, form/dialog layout, or asked "is this usable" / "how should this flow work". Visual polish and pixel-fidelity -- use pixel-perfect-design-implement.
---

# UI/UX Designer — AdminPanel

## Who uses this

The primary persona is a **non-technical academy manager** (Pillar 6: time-to-value) — they must set up, add teachers, and run a first class alone, without a developer. Secondary: teachers (course/lesson authoring, grading), platform staff (ADMIN/SUPPORT — cross-academy oversight, different mental model, different home screen). Design for the manager's competence level first; platform-staff screens can assume more.

## States checklist — every data view needs all of these, explicitly

- **Loading** — skeleton or spinner, never a blank flash.
- **Empty** — a real empty state with a next action ("Add your first course"), not just an empty table. See `docs/ui/*` and the existing `components/*/` empty-state patterns before inventing a new one.
- **Error** — a specific message where the API gives one (via `lib/api-error.ts`), a generic fallback otherwise; never a silent failure.
- **Permission-denied** — hide what a role cannot do, but if a request 403s anyway (stale UI, race), show why — don't just fail silently.

## List vs. cards

More than 4 records → table (`components/shared/data-list` or similar). 4 or fewer → cards. Don't build a fourth pattern; check `components/shared/` first.

## Dialogs

Never scroll — widen the dialog and use a 2-column grid instead. Every async action inside a dialog steps through loading → success/error explicitly (`docs/frontend-dialog-actions.md`) — a dialog that just closes on click with no feedback is a bug here, not a style choice.

## RTL and Persian details

`fa` is the default locale and renders RTL. Logical CSS only (`start`/`end`, `ms-`/`me-`, never `left`/`right`) — Radix `side` props and `transform-origin` are **not** RTL-aware by default and need explicit handling (memory `rtl-logical-positioning`). Persian digits: don't apply `font-mono` to a field showing Persian numerals (it breaks the digit shapes) — route numbers through the shared formatter (memory `persian-number-formatting`). Never show a raw cuid to a user — show the entity's name or a gateway reference instead.

## Onboarding / setup flows

A first-run flow (academy creation, first teacher, first course) is a Pillar-6 surface: minimize steps, default aggressively, never block on an optional field. Guided empty states (a banner or card prompting the next setup step) belong on the dashboard, not buried in a settings page.

## Copy

Tone and wording (especially Persian vocabulary — `دانشجو` vs `کاربر`, `اشتراک آکادمی` vs `پلن‌های دانشجو`) follow the locked conventions in memory `adminpanel-fa-naming-conventions`. Marketing/growth copy questions go to `seo-marketing-expert`, not here.

## When reviewing a UI change

Ask: does every state (loading/empty/error/permission) exist; is it RTL-correct; does it reuse an existing pattern instead of inventing one; would a manager with no technical background understand it without help. Visual pixel-fidelity to a design file is `pixel-perfect-design-implement`'s job, not this skill's.
