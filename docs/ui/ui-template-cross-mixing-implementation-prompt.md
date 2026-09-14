# Implementation Prompt: Cross-Template Section-Mixing & Unified Design System Upgrade

> Hand this whole file to an AI coding agent as its task brief. It is self-contained — grounded in verified file paths and current repo state as of 2026-06-07.

## Role

You are a senior fullstack engineer working across three repos in a Turborepo monorepo: `Backend` (NestJS/Prisma/Postgres), `edusphere` (Next.js — public site + block renderer), `AdminPanel` (Next.js — academy-owner dashboard/editor). Follow the project's `CLAUDE.md` rules: strict TypeScript, no `any`, minimal/simple changes, no over-engineering, theme-variable-only styling, brief commit messages per repo.

## Goal

Evolve the existing UI-template system (documented in `docs/ui-template-architecture.md`) so that:

1. Academy owners can freely mix **full-width sections** from any developer-authored template into one draft, stacked above/below each other in any order.
2. **One draft design system** — covering both **colors and sizes** (spacing, container width, heading scale, image dimensions) — applies uniformly to every section regardless of which template it originated from.
3. Owners **upload their own static images** per section (no theme-derived placeholders), with **bounded, variable image/container dimensions** (enum-based sizes, not freeform px, to keep layouts coherent).
4. Sections like `courses`/`membership` remain **dynamic** (live backend data); marketing sections (`hero`, `features`, `testimonials`, `footer`, `header`) stay **static config**.
5. New templates are added by **developers** (not end users) as registered section variants — never via end-user-authored code/schemas.

## Ground truth (verified — do not re-derive, just confirm still true before editing)

- `Backend/src/ui-template/section-catalog.ts` → `buildSectionCatalog()` already flattens every preset's blocks into a flat, importable list (`{presetId, blockId, blockType, sectionVariant, hasImagePlaceholder}`). This IS the variant registry — extend it, don't replace it.
- `Backend/src/theme/theme-css.util.ts` + `Backend/src/theme/dto/update-theme-config.dto.ts` → design system currently covers **colors + shape only** (`--theme-primary/secondary/accent/background`, `border_radius_style`, `shadow_style`). **No size/spacing tokens exist yet** — this is the gap to fill.
- `Backend/src/images/images.controller.ts` → generic upload endpoint already exists (`POST /images/upload`, multer-backed). Reuse it; do not build a new upload pipeline.
- `edusphere/components/ui-blocks/blocks-renderer.tsx` → already sorts by `order` and dispatches on `block.type`. Full-width stacking already works structurally — do not restructure it.
- `AdminPanel/components/ui-template/section-library-modal.tsx` and `block-editor.tsx` (907 lines) → cross-template import UI and per-block config editor already exist. Extend them; don't rewrite.

## Task list (work through in this order; each task references exact files)

### Backend

1. **Add size tokens to the design system**
   - `Backend/src/theme/dto/update-theme-config.dto.ts`: add `section_spacing?: 'compact'|'comfortable'|'spacious'`, `container_width?: 'narrow'|'standard'|'wide'|'full'`, `heading_scale?: 'compact'|'standard'|'large'`, each `@IsOptional() @IsIn([...])`.
   - `Backend/src/theme/theme-css.util.ts`: add `SECTION_SPACING_MAP`, `CONTAINER_WIDTH_MAP`, `HEADING_SCALE_MAP` (mirror `BORDER_RADIUS_MAP`/`SHADOW_MAP` pattern), and emit `--theme-section-padding-y`, `--theme-container-max-width`, `--theme-heading-size-{sm,md,lg}` from `buildThemeCssVariables`.
   - Update `DEFAULT_THEME_CSS_INPUT` with sane defaults for the three new keys.
2. **Extend the registry contract**
   - `Backend/src/ui-template/section-catalog.ts`: extend `SectionCatalogEntry` with `imageSlots: { key: string; aspect: '16:9'|'4:3'|'1:1'|'auto'; sizeOptions: ('sm'|'md'|'lg'|'full')[] }[]`, derived by inspecting each block's `config` (replace/augment the `hasImagePlaceholder` heuristic with a structured slot list).
3. **Bound per-section media sizing in the block config schema**
   - `Backend/src/ui-template/dto/create-ui-template.dto.ts` (`UIBlockConfigDto`): add validated, enum-only fields `mediaSize?: 'sm'|'md'|'lg'|'full'` and `mediaAspect?: '16:9'|'4:3'|'1:1'|'auto'` with `@IsIn`. **Do not accept freeform numeric px/rem** — that breaks full-width stacking coherence.
4. **Wire uploads into block config**
   - Confirm/extend `Backend/src/images/images.controller.ts` so an authenticated academy owner can upload an image and receive a stable URL; document (in a short code comment, not a new module) that this URL is what gets written into `draft_blocks[].config.<imageKey>`.
5. **Document the developer-authoring contract**
   - In `Backend/src/ui-template/templates/template-presets.ts`, add a top-of-file comment block stating the contract every new preset's blocks must satisfy: (a) all image fields default to `null`, (b) styling uses only `--theme-*` variables — no hardcoded colors/sizes, (c) renders full-width with no cross-section layout assumptions.

### Edusphere

6. **Audit every block-style-variant for theme-variable purity**
   - Files: `hero-block.tsx`, `features-block.tsx`, `courses-block.tsx`, `testimonials-block.tsx`, `membership-block.tsx`, `footer-block.tsx`, `header-block.tsx`, `hero-illustration.tsx`, `hero-slideshow.tsx`, `sidebar-block*.tsx`.
   - Grep each for hardcoded hex/oklch/rgb colors and hardcoded px/rem sizing; replace with `var(--theme-*)` (existing color vars) and the new size vars from Task 1.
7. **Add a shared `<SectionMedia>` primitive**
   - New small component in `edusphere/components/ui-blocks/` that reads `config.mediaSize`/`config.mediaAspect`, resolves them against the new `--theme-*` size tokens, and renders the uploaded image in a correctly-sized container. Refactor every variant with an image slot (hero illustration/background, feature icons, course thumbnails, testimonial avatars) to use it instead of ad-hoc `<img>`/`<div style={{backgroundImage}}>` markup.
8. **Verify `blocks-renderer.tsx` requires no structural change** — confirm `order`-sort + full-width rendering already satisfies "stack any mix of sections above/below each other." If you find any block assuming a sibling layout (grid placement, fixed neighbor), flag and fix it — that would be a hidden coupling that breaks free mixing.

### AdminPanel

9. **Surface registry metadata in the import UI**
   - `AdminPanel/components/ui-template/section-library-modal.tsx`: render the new `imageSlots` info on each catalog card (e.g., "needs 1 background image, 3 avatars") using the extended `SectionCatalogEntry` type.
10. **Wire upload + bounded size controls into the block editor**
    - `AdminPanel/components/ui-template/block-editor.tsx`: for every declared image slot, add (a) an upload control hitting the images endpoint, storing the returned URL in `config.<key>`, and (b) a segmented/select control for `mediaSize`/`mediaAspect` constrained to the catalog's `sizeOptions` — never a raw px input.
11. **Add the new size tokens to the global design-system controls**
    - `AdminPanel/components/ui-template/template-customization-sidebar.tsx`: add segmented controls for `section_spacing`, `container_width`, `heading_scale` alongside the existing color controls, calling the same theme-update endpoint.
12. **Verify reorder works across mixed origins**
    - `AdminPanel/components/ui-template/blocks-list.tsx`: confirm drag-reorder mutates `draft_blocks[].order` without any assumption that adjacent sections share a `presetId`/origin.

### Documentation

13. **Update `docs/ui-template-architecture.md`**
    - Redefine "Template preset" from "fixed set of sections" → "named bundle of variant selections + a design-system baseline."
    - Strengthen "Cross-template sections" language: all sections are cross-compatible **by contract**, not by exception.
    - Add a "Section variant registry / contract" subsection documenting the canonical `configSchema` rules (theme-variable-only styling, nulled image slots, full-width-only rendering, bounded `mediaSize`/`mediaAspect` enums).
    - Extend the "Images" section to cover owner-uploaded photographic assets with bounded variable dimensions, not just illustrations.
    - Add the new size tokens (`section_spacing`, `container_width`, `heading_scale`) to the design-system token list.

## Hard constraints (violating any of these = not done, regardless of what else works)

- No hardcoded colors, px, or rem values in any block-variant component — everything must resolve through `--theme-*` CSS variables.
- No freeform numeric image-size inputs anywhere in AdminPanel or the DTOs — only the bounded enums (`sm|md|lg|full`, `16:9|4:3|1:1|auto`).
- No new "generic schema/DSL renderer" — stay within the bounded component-registry model (matches existing security rule: "no arbitrary block injection").
- `class-validator` DTOs must reject any value outside the declared enums (write/run a quick test or manual `curl` check per new field).
- TypeScript strict mode must pass with zero `any`.

## Verification checklist — run after EVERY batch of changes, not just at the end

Re-run this full list each pass. Do not report completion until every line is checked TRUE with evidence (file path + line, or command output):

- [ ] `theme-css.util.ts` emits `--theme-section-padding-y`, `--theme-container-max-width`, `--theme-heading-size-*` and they resolve to non-empty values for default theme input
- [ ] `update-theme-config.dto.ts` rejects an invalid `section_spacing`/`container_width`/`heading_scale` value (manually verify validation pipe behavior)
- [ ] `SectionCatalogEntry.imageSlots` is populated for at least one entry of every `blockType` that has image fields
- [ ] `UIBlockConfigDto` rejects a non-enum `mediaSize`/`mediaAspect` value
- [ ] grep across all `edusphere/components/ui-blocks/*.tsx` for hex/oklch/rgb/px/rem literals returns **zero** matches outside the new token-mapping files in Backend
- [ ] `<SectionMedia>` exists and is used by every variant component that previously rendered an image/background image directly (list them and confirm each one switched)
- [ ] `section-library-modal.tsx` visibly displays image-slot requirements per catalog entry
- [ ] `block-editor.tsx` shows an upload control + bounded size picker for every image slot, and saving writes the uploaded URL into `draft_blocks[].config`
- [ ] `template-customization-sidebar.tsx` exposes the three new size tokens and persists them via the theme-update call
- [ ] End-to-end manual test: import a section from template A into a draft based on template B, change the global design system (one color + one size token), and confirm the imported section visually adopts both — no leftover hardcoded styling
- [ ] `docs/ui-template-architecture.md` reflects every contract change listed in Task 13 (diff the doc against the task list line by line)
- [ ] `tsc --noEmit` (or repo's type-check script) passes with zero errors in all three repos
- [ ] Existing tests for `theme.service.spec.ts`, `theme.controller.spec.ts`, and any `ui-template`/`ui-blocks` tests still pass

## Process instructions for you (the agent)

1. Work task-by-task in the listed order; commit small, working increments per repo with brief messages.
2. After each task, run the relevant subset of the verification checklist immediately — don't wait until the end to discover a gap.
3. Before declaring the overall job done, run the **entire** checklist fresh, in order, and produce a final report mapping each checklist line to the file/line/command that proves it. Any unchecked or uncertain item means the job is **not** done — go fix it and re-run the full checklist again.
4. If you discover a hidden coupling, missing file, or a checklist item that can't be satisfied as written, stop and explain the conflict rather than silently skipping it or weakening the constraint.
