// Slot model — AdminPanel mirror of Backend/src/ui-template/slot-config.ts.
// Bounds here MUST match the backend clamp ranges so the editor never lets an
// owner submit a value the server would silently clamp.

export type SlotVisibility = 'live' | 'placeholder' | 'hidden';
export const SLOT_VISIBILITY: SlotVisibility[] = [
  'live',
  'placeholder',
  'hidden'
];

export interface SlotConfig {
  visibility: SlotVisibility;
  placeholderText?: string;
}

export interface SlotStyle {
  minWidth?: number;
  height?: number;
  padding?: number;
  gap?: number;
}

interface SliderSpec {
  key: keyof SlotStyle;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const SLOT_STYLE_SLIDERS: SliderSpec[] = [
  { key: 'minWidth', label: 'Card width', min: 160, max: 480, step: 10 },
  { key: 'height', label: 'Card height', min: 0, max: 640, step: 10 },
  { key: 'padding', label: 'Card padding', min: 0, max: 48, step: 2 },
  { key: 'gap', label: 'Grid gap', min: 0, max: 48, step: 2 }
];

// Default slot count per fixed-count grid section (how many slot toggles to show).
export const GRID_SLOT_COUNTS: Record<string, number> = {
  courses: 6,
  features: 6,
  testimonials: 3,
  pricing: 3,
  projects: 4,
  categories: 6,
  'course-grid': 6
};

export const isGridSection = (type: string): boolean =>
  type in GRID_SLOT_COUNTS;

// Editable static-text overrides per section. Only keys the storefront blocks
// actually read are listed, so the editor never shows a field with no effect.
export const GRID_SECTION_TEXT_FIELDS: Record<
  string,
  { key: string; label: string }[]
> = {
  courses: [
    { key: 'eyebrow', label: 'Eyebrow label' },
    { key: 'viewAll', label: 'View-all link' },
    { key: 'viewAllButton', label: 'View-all button' }
  ],
  categories: [{ key: 'label', label: 'Strip label' }],
  'course-grid': [
    { key: 'label', label: 'Eyebrow label' },
    { key: 'title', label: 'Title' },
    { key: 'viewAllText', label: 'View-all link' }
  ]
};
