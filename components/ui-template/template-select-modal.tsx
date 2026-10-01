'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import type { TemplatePreset } from '@/types/api';
import { getDesignSystem } from '@/lib/design-systems';
import { TemplateSelectContent } from './template-select-modal/template-select-content';
import { Category } from './_lib/template-select-modal-helpers';

interface TemplateSelectModalProps {
  open: boolean;
  onClose: () => void;
  presets: TemplatePreset[];
  activePresetId: string;
  onApply: (presetId: string) => Promise<void>;
  onDelete?: (preset: TemplatePreset) => Promise<void>;
  isApplying: boolean;
}

/**
 * "Featured" is earned, not curated: the best-rated templates managers have
 * actually voted on. The vote floor keeps a single five-star from promoting a
 * template nobody else has tried.
 */
const MIN_VOTES_TO_FEATURE = 3;
const FEATURED_LIMIT = 3;

function featuredIds(presets: TemplatePreset[]): Set<string> {
  return new Set(
    presets
      .filter((p) => (p.ratingCount ?? 0) >= MIN_VOTES_TO_FEATURE)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, FEATURED_LIMIT)
      .map((p) => p.id),
  );
}

export function TemplateSelectModal({
  open,
  onClose,
  presets,
  activePresetId,
  onApply,
  onDelete,
  isApplying,
}: TemplateSelectModalProps) {
  const [selectedId, setSelectedId] = useState(activePresetId);
  const [category, setCategory] = useState<Category>('all');

  const featured = featuredIds(presets);

  const filtered = presets.filter((p) => {
    if (category === 'all') return true;
    if (category === 'dedicated') return p.visibility === 'DEDICATED';
    if (category === 'featured') return featured.has(p.id);
    return !featured.has(p.id) && p.visibility !== 'DEDICATED';
  });

  const featuredPresets = filtered.filter((p) => featured.has(p.id));
  const classicPresets = filtered.filter((p) => !featured.has(p.id));

  const selectedDs = selectedId ? getDesignSystem(selectedId) : null;
  const selectedPreset = presets.find((p) => p.id === selectedId);

  const handleApply = async () => {
    if (selectedId && selectedId !== activePresetId) await onApply(selectedId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <TemplateSelectContent
        activePresetId={activePresetId}
        category={category}
        classicPresets={classicPresets}
        featuredPresets={featuredPresets}
        filtered={filtered}
        handleApply={handleApply}
        isApplying={isApplying}
        onClose={onClose}
        onDelete={onDelete}
        selectedDs={selectedDs}
        selectedId={selectedId}
        selectedPreset={selectedPreset}
        setCategory={setCategory}
        setSelectedId={setSelectedId}
      />
    </Dialog>
  );
}
