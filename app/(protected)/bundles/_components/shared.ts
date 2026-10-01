import type { Offer } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Course = { id: string; title: string; price: number; slug: string };

// A bundle is simply an Offer that unlocks several courses at one price.
export type Bundle = Offer & { courses?: Course[] };
