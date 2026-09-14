# How to Add a Template & File Logic Flow

## The Big Picture

3 projects, 1 pipeline:

```
AdminPanel (editor) → Backend (stores/validates) → Edusphere (renders)
```

---

## File Logic Flow

### 1. Backend — the source of truth

| File | What it does |
|------|-------------|
| `Backend/src/ui-template/templates/template-presets.ts` | **Where you add new templates.** Register a named preset with an array of blocks. |
| `Backend/src/ui-template/section-catalog.ts` | Flattens all presets into a flat catalog. Derives `imageSlots` + `gridInfo` per block. |
| `Backend/src/ui-template/dto/create-ui-template.dto.ts` | Validates block shape: `id`, `type`, `order`, `isVisible`, `config`, `mediaSize`, `mediaAspect`. |
| `Backend/src/ui-template/ui-template.service.ts` | CRUD for draft/published templates. |
| `Backend/src/ui-template/ui-template.controller.ts` | Exposes `GET /ui-template/sections` (catalog) and `POST /draft/sections` (import). |
| `Backend/src/theme/theme-css.util.ts` | Maps theme config values → CSS variables (`--theme-primary`, `--theme-section-padding-y`, etc.). |
| `Backend/src/theme/dto/update-theme-config.dto.ts` | Validates design-system inputs: `primary_color`, `border_radius_style`, `shadow_style`, `section_spacing`, `container_width`, `heading_scale`. |

### 2. Edusphere — the renderer

| File | What it does |
|------|-------------|
| `edusphere/components/ui-blocks/blocks-renderer.tsx` | Sorts blocks by `order`, dispatches each `block.type` to the right component. |
| `edusphere/components/ui-blocks/<name>-block.tsx` | One file per block type. Reads `config` and renders using only `var(--theme-*)` variables. |
| `edusphere/components/ui-blocks/section-media.tsx` | Shared image primitive. Resolves `mediaSize`/`mediaAspect` enums into sized containers. |
| `edusphere/app/globals.css` | Applies `--theme-*` CSS variables to `.ui-blocks-root` (scope for all blocks). |

### 3. AdminPanel — the editor

| File | What it does |
|------|-------------|
| `AdminPanel/components/ui-template/blocks-list.tsx` | Drag-reorder of `draft_blocks[]`. Mutates `order` only — no preset assumptions. |
| `AdminPanel/components/ui-template/section-library-modal.tsx` | Shows the flat catalog. Owner picks a section from any preset to add to their draft. |
| `AdminPanel/components/ui-template/block-editor.tsx` | Edits `config` for a single block: text, images, `mediaSize`/`mediaAspect`, slot visibility. |
| `AdminPanel/components/ui-template/template-customization-sidebar.tsx` | Global design-system controls: brand color, border radius, shadow, spacing, container width, heading scale. |
| `AdminPanel/components/ui-template/edusphere-preview-frame.tsx` | Embeds Edusphere as iframe with `?preview=TOKEN&embed=1` for live WYSIWYG. |

---

## How to Add a New Template (Step by Step)

### Step 1 — Backend: register the preset

Open `Backend/src/ui-template/templates/template-presets.ts` and add a new entry to `TEMPLATE_PRESETS`:

```ts
mytemplate: {
  id: 'mytemplate',
  name: 'My Template',
  description: 'Short description',
  blocks: [
    { id: 'header',      type: 'header',       order: 0, isVisible: true, config: { sticky: true } },
    { id: 'hero',        type: 'hero',          order: 1, isVisible: true, config: { style: 'my-hero-style' } },
    { id: 'features',    type: 'features',      order: 2, isVisible: true, config: { style: 'my-features-style' } },
    { id: 'courses',     type: 'course-grid',   order: 3, isVisible: true, config: {} },
    { id: 'footer',      type: 'footer',        order: 4, isVisible: true, config: {} },
  ],
}
```

**Rules every block must follow:**
- All image fields (`backgroundImage`, `illustration`, `logo`, etc.) must default to `null`
- Use only `--theme-*` CSS variables — no hardcoded hex, px, or rem
- Render full-width — no cross-section layout assumptions

### Step 2 — Backend: section catalog updates automatically

`buildSectionCatalog()` in `section-catalog.ts` reads all presets at startup. **No change needed** — your blocks appear in `GET /ui-template/sections` automatically.

If your block has a new image slot type, add it to `deriveImageSlots()` in `section-catalog.ts`.

### Step 3 — Edusphere: add the block variant (if new style)

If `config.style` is a new variant of an existing type (e.g., `hero` with style `my-hero-style`), open the block's file (e.g., `hero-block.tsx`) and add a new style branch:

```tsx
// in hero-block.tsx
if (config.style === 'my-hero-style') return <MyHeroStyle config={config} />;
```

If it's a brand new block **type** (not just a style variant):

1. Create `edusphere/components/ui-blocks/my-new-block.tsx`
2. Import and add a `case 'my-new-type':` in `blocks-renderer.tsx`

### Step 4 — Styling rules (hard constraint)

Every block component must use only CSS variables:

```tsx
// CORRECT
<section style={{ background: 'var(--theme-background)' }}>

// WRONG — breaks when mixed into another template
<section style={{ background: '#1a1a2e' }}>
```

Available theme variables:
- Colors: `--theme-primary`, `--theme-secondary`, `--theme-accent`, `--theme-background`, `--theme-foreground`
- Spacing: `--theme-section-padding-y`, `--theme-container-max-width`
- Typography: `--theme-heading-size-sm`, `--theme-heading-size-md`, `--theme-heading-size-lg`
- Shape: `--theme-border-radius`, `--theme-shadow`

### Step 4.5 — Make every word editable (hard constraint)

The manager edits the site by clicking text directly on the preview canvas, so
**no user-visible string may be hardcoded in JSX**. Each one must come from
`config` and carry a marker the editor bridge can find.

**Single values** — read through `text()` and mark the element:

```tsx
<h2 data-editable="title">{text(config, 'title', d.title)}</h2>
```

A hardcoded label around a value (`الگوی حل: {x}`) counts too: give it its own
key (`boardPatternLabel`) and its own default in `defaults.ts`.

**Repeated values** (cards, stats, table rows, chips) — the array may still be
the template default, so the container carries the resolved array as JSON and
each cell carries its path. Use the helpers:

```tsx
import { editableList, editableItem } from '../_shared/editable-list';

const items = list<FeatureItem>(config, 'items', d.items);

<div {...editableList('items', items)}>
  {items.map((item, index) => (
    <h3 {...editableItem('items', index, 'title')}>{item.title}</h3>
  ))}
</div>
```

Editing one cell saves the **whole array**, so sibling items and non-text
fields (`lead`, `fill`, `href`) survive. Paths nest — `editableItem('rows', i,
'cells', j, 'text')` — and a list of plain strings takes no field name.

**A number with no text** (a progress bar) uses `data-editable-range` with the
same path; clicking along the track sets the percentage:

```tsx
<div className={styles.track} data-editable-range={`steps.${index}.fill`}>
  <span style={{ width: `${step.fill}%` }} />
</div>
```

Put `editableList` on a container that wraps the **whole** array, never inside
the `.map()` — two containers would each hold their own stale snapshot.
Live academy data (courses, teachers pulled from the API) stays `data-dynamic`
and is never marked editable.

### Step 5 — AdminPanel: nothing required

The section-library modal reads the catalog from `GET /ui-template/sections` — your new blocks appear automatically. No AdminPanel changes needed unless you want custom editor controls.

---

## Data Flow Summary

```
1. Owner opens builder  →  AdminPanel fetches GET /ui-template/current/draft
2. Owner picks sections →  GET /ui-template/sections (flat catalog from all presets)
3. Owner adds a section →  POST /ui-template/current/draft/sections { presetId, blockId }
4. Owner edits config   →  PATCH /ui-template/current/draft (saves draft_blocks)
5. Owner changes colors →  PATCH /theme/current/config/draft (saves design system)
6. Preview iframe loads →  Edusphere /{slug}?preview=TOKEN reads draft, renders blocks
7. Owner publishes      →  POST /ui-template/current/publish-site (draft → published)
8. Public visits site   →  Edusphere reads published blocks, no token needed
```

---

## Existing Block Types

| Type | Dynamic? | Style variants |
|------|----------|---------------|
| `header` | No | sticky/non-sticky |
| `hero` | No | `flow`, `creative`, `dark-programmer`, + more |
| `features` | No | `flow-cards`, `flow-stats`, `stats`, `creative-pillars`, `instructors`, + more |
| `course-grid` | Yes (live data) | default |
| `courses` | Yes (live data) | default |
| `testimonials` | No | `flow`, + more |
| `membership` | Yes (live data) | default |
| `pricing` | No | default |
| `cta` | No | default |
| `footer` | No | default |
| `marquee` | No | default |
| `categories` | Yes (live data) | default |
| `projects` | No | default |
| `sidebar` | Yes (live data) | default |
