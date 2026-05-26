'use client';

import { useState } from 'react';
import {
  Check,
  Sparkles,
  Users,
  BookOpen,
  Layout,
  Minimize2,
  Type
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TemplatePreview } from './template-preview';
import type { TemplatePreset } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { DESIGN_SYSTEMS } from '@/lib/design-systems';

interface TemplateSelectModalProps {
  open: boolean;
  onClose: () => void;
  presets: TemplatePreset[];
  activePresetId: string;
  onApply: (presetId: string) => Promise<void>;
  isApplying: boolean;
}

type Category =
  | 'all'
  | 'featured'
  | 'creator'
  | 'academy'
  | 'community'
  | 'classic';

interface PresetCategory {
  id: Category;
  label: string;
  icon: React.ElementType;
}

const PRESET_CATEGORY: Record<
  string,
  { category: Category; featured: boolean }
> = {
  kajabi: { category: 'academy', featured: true },
  podia: { category: 'creator', featured: true },
  stan: { category: 'creator', featured: true },
  circle: { category: 'community', featured: true },
  modern: { category: 'classic', featured: false },
  classic: { category: 'classic', featured: false },
  minimal: { category: 'classic', featured: false },
  academy: { category: 'academy', featured: false },
  'student-focused': { category: 'academy', featured: false },
  'courses-first': { category: 'classic', featured: false },
  featured: { category: 'classic', featured: false },
  compact: { category: 'classic', featured: false }
};

const CATEGORIES: PresetCategory[] = [
  { id: 'all', label: 'All', icon: Layout },
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'creator', label: 'Creator', icon: Users },
  { id: 'academy', label: 'Academy', icon: BookOpen },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'classic', label: 'Classic', icon: Minimize2 }
];

const RADIUS_LABEL: Record<string, string> = {
  sharp: 'Sharp',
  soft: 'Soft',
  rounded: 'Rounded'
};

export function TemplateSelectModal({
  open,
  onClose,
  presets,
  activePresetId,
  onApply,
  isApplying
}: TemplateSelectModalProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(activePresetId);
  const [category, setCategory] = useState<Category>('all');

  const filtered = presets.filter((p) => {
    if (category === 'all') return true;
    if (category === 'featured') return PRESET_CATEGORY[p.id]?.featured;
    return PRESET_CATEGORY[p.id]?.category === category;
  });

  const featuredPresets = filtered.filter(
    (p) => PRESET_CATEGORY[p.id]?.featured
  );
  const classicPresets = filtered.filter(
    (p) => !PRESET_CATEGORY[p.id]?.featured
  );

  const selectedDs = selectedId ? DESIGN_SYSTEMS[selectedId] : null;
  const selectedPreset = presets.find((p) => p.id === selectedId);

  const handleApply = async () => {
    if (selectedId && selectedId !== activePresetId) await onApply(selectedId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b bg-background px-6 py-4">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {t('settings.chooseTemplateLayout')}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('settings.uiTemplateBuilder')}
            </p>
          </div>
          {selectedDs && (
            <div className="flex items-center gap-2">
              {/* Selected DS color strip */}
              <div className="flex items-center gap-1">
                {[
                  selectedDs.colors.primary,
                  selectedDs.colors.secondary,
                  selectedDs.colors.accent,
                  selectedDs.colors.background
                ].map((c, i) => (
                  <span
                    key={i}
                    className="h-4 w-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold leading-none">
                  {selectedDs.name}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {selectedDs.tagline}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Category tabs ── */}
        <div className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-b bg-muted/20 px-6 py-2.5">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                category === id
                  ? 'border-foreground bg-foreground text-background shadow-sm'
                  : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Template grid ── */}
        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          {/* Featured 2-col */}
          {featuredPresets.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Featured Templates
                </h3>
                <span className="text-xs text-muted-foreground/60">
                  — styled after top creator platforms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {featuredPresets.map((preset) => (
                  <TemplateCard
                    key={preset.id}
                    preset={preset}
                    isActive={preset.id === activePresetId}
                    isSelected={preset.id === selectedId}
                    onSelect={() => setSelectedId(preset.id)}
                    large
                  />
                ))}
              </div>
            </section>
          )}

          {/* Classic layouts 3-col */}
          {classicPresets.length > 0 && (
            <section>
              {featuredPresets.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Simple Layouts
                  </h3>
                  <span className="text-xs text-muted-foreground/60">
                    — clean, versatile starting points
                  </span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                {classicPresets.map((preset) => (
                  <TemplateCard
                    key={preset.id}
                    preset={preset}
                    isActive={preset.id === activePresetId}
                    isSelected={preset.id === selectedId}
                    onSelect={() => setSelectedId(preset.id)}
                    large={false}
                  />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Layout className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">No templates in this category</p>
            </div>
          )}
        </div>

        {/* ── Design System token strip (shown when selection differs from active) ── */}
        {selectedDs && selectedId !== activePresetId && (
          <div className="flex flex-shrink-0 items-center gap-6 border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Design System
              </span>
            </div>
            {/* Color tokens */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Primary', color: selectedDs.colors.primary },
                { label: 'Secondary', color: selectedDs.colors.secondary },
                { label: 'Accent', color: selectedDs.colors.accent },
                { label: 'Background', color: selectedDs.colors.background }
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="h-5 w-5 flex-shrink-0 rounded-md border border-white shadow-sm ring-1 ring-black/10"
                    style={{ background: color }}
                  />
                  <div>
                    <p className="text-[9px] leading-none text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-mono text-[10px] font-medium leading-snug">
                      {color}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                {selectedDs.typography.fontFamily}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                {RADIUS_LABEL[selectedDs.shape.borderRadius]}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {selectedDs.shape.shadow === 'none'
                  ? 'No shadow'
                  : `${selectedDs.shape.shadow} shadow`}
              </span>
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className="flex flex-shrink-0 items-center justify-between border-t bg-background px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {selectedId === activePresetId
              ? 'Select a different template to apply changes'
              : `Apply "${selectedPreset?.name}" — includes layout blocks and design system tokens`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={isApplying || selectedId === activePresetId}
            >
              {isApplying
                ? t('settings.applying')
                : t('settings.applyTemplate')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Template Card ─────────────────────────────────────────────────────────────

interface TemplateCardProps {
  preset: TemplatePreset;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  large: boolean;
}

function TemplateCard({
  preset,
  isActive,
  isSelected,
  onSelect,
  large
}: TemplateCardProps) {
  const ds = DESIGN_SYSTEMS[preset.id];
  const category = PRESET_CATEGORY[preset.id]?.category ?? 'classic';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full cursor-pointer overflow-hidden rounded-xl border-2 bg-background text-left transition-all duration-200 ${
        isSelected
          ? 'border-foreground shadow-lg shadow-black/10'
          : 'border-border hover:border-foreground/30 hover:shadow-md'
      }`}
    >
      {/* Primary color accent strip */}
      <div
        className="h-1 w-full"
        style={{ background: ds?.colors.primary ?? '#6b7280' }}
      />

      {/* Radio indicator + badges */}
      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
        {isActive && (
          <span className="inline-flex items-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
            Active
          </span>
        )}
        {/* Radio circle */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
            isSelected
              ? 'border-foreground bg-foreground shadow-sm'
              : 'border-muted-foreground/40 bg-background group-hover:border-foreground/60'
          }`}
        >
          {isSelected && (
            <Check className="h-3 w-3 text-background" strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div
        className={`overflow-hidden border-b border-border/50 bg-muted/20 ${large ? 'h-48' : 'h-32'}`}
      >
        <div className="h-full w-full overflow-hidden">
          <TemplatePreview preset={preset} />
        </div>
      </div>

      {/* Card body */}
      <div className="space-y-2 p-3">
        {/* Name + category */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold leading-snug">{preset.name}</p>
            <span
              className="mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
              style={{
                background: ds ? `${ds.colors.primary}15` : '#f3f4f6',
                color: ds?.colors.primary ?? '#6b7280'
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {preset.description}
        </p>

        {/* Design system tokens */}
        {ds && (
          <div className="flex items-center justify-between border-t border-border/40 pt-0.5">
            {/* Color dots */}
            <div className="flex items-center gap-1">
              {[
                ds.colors.primary,
                ds.colors.secondary,
                ds.colors.accent,
                ds.colors.background
              ].map((color, i) => (
                <span
                  key={i}
                  className="ring-black/8 h-3.5 w-3.5 rounded-full border border-white shadow-sm ring-1"
                  style={{ background: color }}
                />
              ))}
            </div>
            {/* Font + radius */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-medium text-muted-foreground/80">
                {ds.typography.fontFamily.split(' ')[0]}
              </span>
              <span
                className="rounded-sm px-1 py-0.5 text-[9px] font-medium text-muted-foreground"
                style={{ background: `${ds.colors.primary}10` }}
              >
                {RADIUS_LABEL[ds.shape.borderRadius]}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
