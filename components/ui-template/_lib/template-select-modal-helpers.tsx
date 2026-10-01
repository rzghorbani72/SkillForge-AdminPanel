import { Check, Sparkles, Layout, Minimize2, Lock, Trash2 } from 'lucide-react';
import { TemplatePreview } from '../template-preview';
import type { TemplatePreset } from '@/types/api';
import { presetSourceKey, formatPresetDisplayName } from '@/lib/ui-template/preset-source';
import { getDesignSystem } from '@/lib/design-systems';

export type Category =
  | 'all'
  | 'featured'
  | 'dedicated'
  | 'creator'
  | 'academy'
  | 'community'
  | 'classic';

export interface PresetCategory {
  id: Category;
  label: string;
  icon: React.ElementType;
}

export const CATEGORIES: PresetCategory[] = [
  { id: 'all', label: 'همه', icon: Layout },
  { id: 'featured', label: 'ویژه', icon: Sparkles },
  { id: 'dedicated', label: 'اختصاصی', icon: Lock },
  { id: 'classic', label: 'کلاسیک', icon: Minimize2 },
];

export const RADIUS_LABEL: Record<string, string> = {
  sharp: 'تیز',
  soft: 'نرم',
  rounded: 'گرد',
};

export const SHADOW_LABEL: Record<string, string> = {
  none: 'بدون سایه',
  subtle: 'سایه ظریف',
  medium: 'سایه متوسط',
  strong: 'سایه قوی',
};

export const CATEGORY_LABEL: Record<string, string> = {
  all: 'همه',
  featured: 'ویژه',
  dedicated: 'اختصاصی',
  classic: 'کلاسیک',
};

// ── Template Card ─────────────────────────────────────────────────────────────

export interface TemplateCardProps {
  preset: TemplatePreset;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (preset: TemplatePreset) => Promise<void>;
  large: boolean;
}

export function TemplateCard({
  preset,
  isActive,
  isSelected,
  onSelect,
  onDelete,
  large,
}: TemplateCardProps) {
  const ds = getDesignSystem(presetSourceKey(preset));
  const isDedicated = preset.visibility === 'DEDICATED';
  const category = isDedicated ? 'dedicated' : 'classic';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) await onDelete(preset);
  };

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
      <div className="h-1 w-full" style={{ background: ds?.colors.primary ?? '#6b7280' }} />

      {/* Radio indicator + badges */}
      <div className="absolute end-3 top-3 z-10 flex flex-col items-end gap-1.5">
        {isActive && (
          <span className="inline-flex items-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
            فعال
          </span>
        )}
        {isDedicated && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
            <Lock className="h-2.5 w-2.5" />
            اختصاصی
          </span>
        )}
        {isDedicated && preset.isOwned && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-full bg-red-50 p-1 text-red-600 transition-colors hover:bg-red-100"
            aria-label="حذف قالب اختصاصی"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
        {/* Radio circle */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
            isSelected
              ? 'border-foreground bg-foreground shadow-sm'
              : 'border-muted-foreground/40 bg-background group-hover:border-foreground/60'
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
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
            <p className="text-sm font-semibold leading-snug">
              {formatPresetDisplayName(preset.name)}
            </p>
            <span
              className="mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider"
              style={{
                background: ds ? `${ds.colors.primary}15` : '#f3f4f6',
                color: ds?.colors.primary ?? '#6b7280',
              }}
            >
              {CATEGORY_LABEL[category] ?? category}
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
              {[ds.colors.primary, ds.colors.secondary, ds.colors.accent, ds.colors.background].map(
                (color, i) => (
                  <span
                    key={i}
                    className="ring-black/8 h-3.5 w-3.5 rounded-full border border-white shadow-sm ring-1"
                    style={{ background: color }}
                  />
                ),
              )}
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
