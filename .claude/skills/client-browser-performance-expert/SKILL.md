---
name: client-browser-performance-expert
description: Use when a page feels slow, before adding memoization, when reviewing bundle size, image/video loading, or asked to improve Lighthouse/load performance. Measure first -- this skill is not a license to add useMemo everywhere.
---

# Client & Browser Performance Expert — AdminPanel

Measure-then-optimize. This is a private dashboard (no SEO/Core-Web-Vitals-for-ranking concern) but managers judge the product's quality by how snappy the panel feels — slow = looks cheap.

## Before touching anything: measure

- `next build` output shows per-route bundle size — check it changed the way you expect before/after.
- React DevTools Profiler for a specific slow interaction, not a guess.
- Don't add `useMemo`/`useCallback` speculatively — CLAUDE.md's rule is "memoize expensive computations," not everything. An unnecessary memo adds a dependency-array bug surface for no measured gain.

## Bundle size

- Dynamic-`import()` a heavy, rarely-used component (a rich editor, a large chart library, `ui-template` preview panes) instead of bundling it into the initial page load.
- Check `lib/i18n/translations/*.ts` — these are large data files; confirm they're not being pulled into every client bundle when only the active locale is needed.

## Images

`next/image` for anything raster — it handles responsive sizing and lazy-loading. A plain `<img>` on a real content image is an ESLint warning (`@next/next/no-img-element`) and a real perf regression. See `docs/performance/image-optimization.md`.

## Video

HLS playback uses `hls.js` — load it lazily (dynamic import) on the page that actually plays video, not in a shared layout. Delivered video is capped at 1500 kbps/720p platform-wide (`HLS_MAX_BITRATE_KBPS` on the Backend) — this app doesn't need its own bitrate logic, just don't fight the cap with a custom player config.

## Data fetching

`@tanstack/react-query`'s cache (`components/providers/query-provider.tsx`) already avoids most redundant refetching — check an existing query key (`lib/query/keys.ts`) before adding a new `fetch` that duplicates cached data. A page re-fetching the same list on every render usually means a missing/wrong query key, not a need for a manual cache.

## Fonts

Check how the current font is loaded (likely `next/font`) before adding a new weight/family — an extra font file is a render-blocking cost users pay on every first load.

## Measuring the fix

- Playwright can capture a trace (`--trace on`) for a specific slow flow — use it to confirm an optimization actually moved the number, not just "feels faster."
- `pnpm load-test` / `pnpm load-test:advanced` (k6, `loadtests/`) — API-side load, not client rendering, but relevant when a page's slowness is actually backend latency, not frontend work.

## When reviewing a "make it faster" request

Ask for the actual slow interaction and a number (bundle KB, Profiler flame graph, TTI) before proposing a fix. A fix without a before/after measurement is a guess.
