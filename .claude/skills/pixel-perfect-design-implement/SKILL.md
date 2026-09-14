---
name: pixel-perfect-design-implement
description: Implement pixel-perfect, performant frontend UI in AdminPanel and edusphere. Use when building or refining any visual component, matching a Figma/design, fixing spacing/alignment/responsive/RTL issues, or improving render/load performance. Enforces this repo's shadcn + Radix + Tailwind stack and a measure-then-optimize workflow.
---

# Pixel-Perfect & Performant UI

Both frontends are Next.js App Router + React 19 + Tailwind. The goal is UI that
matches the design exactly AND stays fast. Looks-right is not done; it must also
be measurably fast and accessible.

## The stack to build ON (do not reinvent)

- **shadcn/ui** — style `new-york`, base color `zinc`, CSS variables on. Config in
  `components.json`. Add components with the shadcn CLI; don't hand-roll what
  shadcn provides.
- **Radix primitives** (`@radix-ui/*`) — use these for dialogs, dropdowns, popovers,
  tabs, tooltips, etc. They give accessibility + keyboard nav for free.
- **`cn()`** from `@/lib/utils` (clsx + tailwind-merge) for conditional classes —
  never string-concatenate Tailwind classes manually.
- **lucide-react** for icons.
- **Data**: SWR for client fetching; **forms**: react-hook-form + zod; **toasts**:
  sonner (AdminPanel). **Animation**: framer-motion (edusphere).
- **Theming**: next-themes + CSS variables. Read colors from tokens, never
  hardcode hex — white-label academies re-theme at runtime.

## Pixel-perfect rules

- Use the Tailwind design tokens (spacing, radius, colors) from `tailwind.config.js`
  and the CSS variables — do not invent arbitrary `px` values when a token exists.
- Match the design's exact spacing, font size/weight, line-height, radius, and
  border. When a value isn't on the scale, use Tailwind arbitrary values
  (`gap-[18px]`) rather than guessing the nearest token.
- Build mobile-first; add `sm: md: lg:` breakpoints deliberately. Verify each
  breakpoint, not just desktop.
- **RTL/locale**: v1 ships Persian (`fa`) RTL. Use logical properties
  (`ms-`/`me-`, `ps-`/`pe-`, `start`/`end`) instead of `ml/mr/left/right` so the
  layout mirrors correctly. Test the component in RTL.
- Respect dark mode (next-themes) — check both themes.
- Accessibility is part of "perfect": labels, focus rings, `aria-*` (mostly free
  via Radix), and visible keyboard focus. Don't strip focus outlines.

## Performance rules

- Server Components by default. Add `'use client'` only for state/effects/browser
  APIs — keep client bundles small. Push `'use client'` down to the leaf that
  needs it, not the whole page.
- Code-split heavy/below-the-fold widgets with `next/dynamic`; lazy-load modals,
  charts, editors.
- Images via `next/image` with correct `sizes`/`priority`; avoid layout shift
  (set dimensions). Watch CLS.
- Memoize expensive computations (`useMemo`) and stable callbacks (`useCallback`);
  virtualize long lists/tables (TanStack Table + windowing) instead of rendering
  thousands of rows.
- Avoid unnecessary re-renders: stable keys, lift state only as high as needed,
  don't pass new object/array literals as props every render.
- Prefer CSS/Tailwind transitions for simple motion; reserve framer-motion for
  real interactions. Honor `prefers-reduced-motion`.
- Fetch on the server where possible; use SWR with proper keys + dedupe on the
  client. No `.then()` chains — async/await.

## Workflow (measure, don't guess)

1. Confirm the source of truth: a Figma frame/node link (preferred), or a
   screenshot/spec, and which app + breakpoints. For Figma, use the
   `figma-developer-mcp` tools — `get_figma_data` for the node's exact spacing,
   color, type, and radius values, `download_figma_images` for real asset/icon
   exports — instead of eyeballing a rendered screenshot.
2. Find an existing component in `components/<domain>` or a shadcn primitive before
   creating new. Reuse first.
3. Build it with tokens + `cn()`; wire data/forms with the stack above. Map the
   Figma values from step 1 onto the closest Tailwind/CSS-variable token; only
   fall back to an arbitrary value (`gap-[18px]`) when nothing on the scale matches.
4. Verify visually: each breakpoint, dark mode, and RTL. For non-trivial
   components, use Playwright (already configured via each app's
   `playwright.config.ts`) to screenshot the built page/component in each state
   and compare it side-by-side with the Figma export. Treat this as an accurate
   visual check, not a strict pixel-diff assertion — browser font rendering will
   never match a Figma export byte-for-byte.
5. Once the component is confirmed correct, optionally add a Playwright
   `toHaveScreenshot` baseline snapshot in `e2e/` so a *future* change that
   visually drifts gets caught automatically. This guards against regression
   after the fact, not against the initial Figma match.
6. Verify performance: check the component renders without obvious re-render
   storms; lazy-load if heavy; confirm no CLS from images. Run the app (see the
   run/verify skills) for anything non-trivial rather than asserting it's fast.
7. Report the brief commit message (per commit-summary skill).

## Hard constraints

- Strict TypeScript, no `any`. Type all props.
- Naming: Components PascalCase, files kebab-case.
- Minimal, self-documenting code — no over-engineering, comments only for "why".
- Never hardcode brand colors, currency, or locale — read from theme/academy context.
