# UI Template Architecture

Three projects, one rendering pipeline.

## Responsibilities

| Project        | Role                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**    | Stores draft + published template/theme in DB, validates blocks, issues preview JWT, computes `css_variables`, exposes section catalog |
| **Edusphere**  | Sole block renderer for public site and admin preview                                                                                  |
| **AdminPanel** | Editor UI; embeds Edusphere iframe for WYSIWYG preview                                                                                 |

## Core concepts

### Template preset (source)

A **preset** is a named **bundle of variant selections plus a design-system baseline** — not a fixed, indivisible page. Each preset includes:

- A **design system baseline**: shape tokens (`border_radius_style`, `shadow_style`), size tokens (`section_spacing`, `container_width`, `heading_scale`) and a default brand color
- A selection of registered **section variants** (blocks): header, hero, features, courses, testimonials, footer, etc.
- Section **layout variants** via `config.style` (e.g. `expert`, `creator-store`, `dark-programmer`)

Every block in a preset is an independent, full-width section that can be lifted into any other draft. Presets are not edited directly — they are the catalog academy owners pick from, and they are authored only by developers (see the **Section variant registry / contract** below).

### Draft (owner customization)

When a manager chooses a preset or opens the builder, their academy works on a **draft**:

- `draft_blocks` — ordered list of sections (can mix sections from any preset)
- `draft_template_preset` — base preset id (for shape defaults and reset)
- Theme `draft_configs` — design system values (colors, border radius, shadow)

Draft is saved via:

- `PATCH /ui-template/current/draft`
- `PATCH /theme/current/config/draft`

Publish copies draft → published via `POST /ui-template/current/publish-site`.

### Design system

Each draft has one active design system applied at render time through **CSS variables** (`--theme-primary`, `--theme-secondary`, `--theme-accent`, `--theme-background`, `--theme-border-radius`, etc.). It covers both **colors** and **sizes**, and applies uniformly to every section regardless of which preset it originated from.

**Size tokens** (added alongside the color/shape tokens):

| Theme key         | Values                                     | CSS variable(s)                           |
| ----------------- | ------------------------------------------ | ----------------------------------------- |
| `section_spacing` | `compact` \| `comfortable` \| `spacious`   | `--theme-section-padding-y`               |
| `container_width` | `narrow` \| `standard` \| `wide` \| `full` | `--theme-container-max-width`             |
| `heading_scale`   | `compact` \| `standard` \| `large`         | `--theme-heading-size-sm` / `-md` / `-lg` |

These are bounded enums (not freeform px) so any mix of sections stays coherent. Backend maps them in `Backend/src/theme/theme-css.util.ts`; Edusphere applies them uniformly to every rendered block via `.ui-blocks-root` rules in `edusphere/app/globals.css`; AdminPanel exposes them as segmented controls in the customization sidebar, persisted through `PATCH /theme/current/config/draft`.

**User-controlled**

- **Brand color** (`primary_color`) only

**System-generated (realtime)**

When `primary_color` changes, Backend and AdminPanel derive:

| Token                | Rule                                                    |
| -------------------- | ------------------------------------------------------- |
| `secondary_*`        | Same hue, reduced saturation, darker lightness          |
| `accent_color`       | Triadic offset (~150°) with balanced saturation         |
| `background_*`       | Light tint (97% L) / dark base (10% L) from primary hue |
| `primary_color_dark` | Brighter variant for dark-mode surfaces                 |

Shape tokens (`border_radius_style`, `shadow_style`) come from the chosen preset and remain editable in the Style tab.

Implementation: `Backend/src/theme/design-system-palette.util.ts`, `AdminPanel/lib/design-system-palette.ts`.

### Cross-template sections

**All sections are cross-compatible by contract, not by exception.** Every section variant renders full-width, styles itself only through theme variables, and makes no assumptions about its neighbours — so an owner can stack any mix of sections from any preset, in any order, above or below each other.

Managers add a section from any preset to their draft:

1. `GET /ui-template/sections` — flat catalog of all preset sections (each entry carries its `imageSlots`)
2. `POST /ui-template/current/draft/sections` — `{ presetId, blockId }` clones the section into `draft_blocks`

Reordering only mutates `draft_blocks[].order`; it never depends on a section's origin preset.

**Restyling rule:** section layout (`config.style`) is preserved; colors **and sizes** come from the **draft design-system CSS variables** at render time in Edusphere. No per-section color or size overrides are stored beyond the bounded `mediaSize` / `mediaAspect` enums.

### Section variant registry / contract

New templates are added by **developers**, never by end users, as registered section variants in `Backend/src/ui-template/templates/template-presets.ts`. The flat registry is `buildSectionCatalog()` in `Backend/src/ui-template/section-catalog.ts`. Every variant's `config` must satisfy the canonical schema rules:

- **Theme-variable-only styling** — no hardcoded colors. All color/visual styling resolves through `--theme-*` variables (verified: `edusphere/components/ui-blocks/*.tsx` contains zero hex/oklch/rgb color literals). The only px literals are the clamped slot-sizing fallbacks in `slot-grid.tsx` / `slot-config.ts` (see Slot model below).
- **Nulled image slots** — every image field (`backgroundImage`, `illustration`, `avatar`, `logo`, `image`, `slides[].image`) ships as `null`; owners upload their own assets. Presets carry no theme-derived placeholder art.
- **Full-width-only rendering** — sections own the full viewport width and never rely on a sibling's grid/position.
- **Bounded `mediaSize` / `mediaAspect`** — media sizing uses the enums `sm | md | lg | full` and `16:9 | 4:3 | 1:1 | auto` only (validated by `UIBlockConfigDto`). Freeform numeric sizes are rejected.

Each catalog entry exposes its `imageSlots: { key, aspect, sizeOptions }[]`, derived per block type, so the editor knows which images an owner must supply.

**Images:** owner-uploaded photographic assets (not just illustrations) fill each declared image slot. The block editor uploads via the shared `POST /images/upload` endpoint and writes the returned stable URL (`/api/images/get-image?id=<id>`) into `draft_blocks[].config.<imageKey>`. Edusphere renders every uploaded image through the shared `<SectionMedia>` primitive, which resolves the bounded `mediaSize` / `mediaAspect` against the design-system tokens into a correctly-sized, theme-rounded container. When a slot is empty, `<SectionMedia>` shows a neutral themed placeholder box (no fake art).

### Slot model & sparse-data fill

Fixed-count grid sections (`courses`, `features`, `testimonials`, `pricing`, `projects`, `categories`, `course-grid`) keep their container shape no matter how much live/static data the academy actually has. The model lives under `block.config` and is shared by `Backend/src/ui-template/slot-config.ts` (authority) and its mirror `edusphere/lib/slot-config.ts`:

- `config.slots: { visibility, placeholderText? }[]` — index-aligned **three-way visibility** per slot:
  - `live` — render the next live/static item; **if data runs out it falls back to a styled placeholder** so the grid never collapses.
  - `placeholder` — always render a styled `<PlaceholderCard>` with the owner's text.
  - `hidden` — omit the slot; remaining cards **expand proportionally** (the shared `<SlotGrid>` flex container handles this).
- `config.slotStyle: { minWidth, height, padding, gap }` — **section-wide** card sizing in px, **clamped to layout-safe bounds** (`minWidth 160–480`, `height 0–640`, `padding 0–48`, `gap 0–48`). `<SlotGrid>` emits these as `--slot-*` CSS custom properties wrapped in `clamp()` for defense-in-depth.
- `config.text: Record<string,string>` — **template-level static-text overrides** (eyebrows, decorative labels, CTA copy), stored separately from live content.

`normalizeSlotConfig()` runs inside `UITemplateService.normalizeBlocks()` on every create/update/draft/publish — it clamps `slotStyle`, sanitizes any out-of-enum `slots[].visibility` to `live`, and passes all other config keys through untouched. `UIBlockConfigDto` additionally validates `slots`/`slotStyle` at the API boundary (`@IsIn` on visibility, `@Min/@Max` on sizes). Each catalog entry exposes `gridBearing` and `slotCount` so the AdminPanel knows which sections show slot controls and how many slots to list.

> Note: card/slot sizing is a deliberate, layout-safe exception to the enum-only rule that governs **image** sizing — slot sizes are clamped numerics, image sizes remain bounded enums.

## Data flow

1. Manager edits blocks/theme in AdminPanel.
2. Admin saves **draft** via `PATCH /ui-template/current/draft` and `PATCH /theme/current/config/draft`.
3. Changing brand color auto-derives the full palette before save (client preview + server validation on theme draft save).
4. Admin iframe loads Edusphere with `?preview=TOKEN&embed=1` on `/{academySlug}` (not `/s/{slug}` — that path is internal only).
5. Edusphere reads draft data from public APIs when preview token is valid.
6. **Publish** copies draft to published tables via `POST /ui-template/current/publish-site`.

## Required environment variables

**AdminPanel**

- `NEXT_PUBLIC_STOREFRONT_URL` — Edusphere base URL (e.g. `https://web-academy.darkube.ir`)

**Edusphere**

- `NEXT_PUBLIC_ADMIN_PANEL_URL` — allowed iframe parent (e.g. `https://panel-academy.darkube.ir`)

## Security

- Preview tokens expire in 15 minutes and are scoped to one academy.
- Public APIs return published data only without a valid preview token.
- Embed mode sets `frame-ancestors` to the admin panel origin only.
- Section import validates `presetId` + `blockId` against the preset catalog (no arbitrary block injection).
