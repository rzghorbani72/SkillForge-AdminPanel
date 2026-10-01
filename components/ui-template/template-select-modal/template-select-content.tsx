'use client';

import { Sparkles, Layout, Type } from 'lucide-react';
import { DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TemplatePreset } from '@/types/api';
import { formatPresetDisplayName } from '@/lib/ui-template/preset-source';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import {
  Category,
  CATEGORIES,
  RADIUS_LABEL,
  SHADOW_LABEL,
  TemplateCard,
} from '../_lib/template-select-modal-helpers';
import { DesignSystem } from '@/lib/design-systems';

export function TemplateSelectContent({
  activePresetId,
  category,
  classicPresets,
  featuredPresets,
  filtered,
  handleApply,
  isApplying,
  onClose,
  onDelete,
  selectedDs,
  selectedId,
  selectedPreset,
  setCategory,
  setSelectedId,
}: {
  activePresetId: string;
  category: Category;
  classicPresets: TemplatePreset[];
  featuredPresets: TemplatePreset[];
  filtered: TemplatePreset[];
  handleApply: () => Promise<void>;
  isApplying: boolean;
  onClose: () => void;
  onDelete: ((preset: TemplatePreset) => Promise<void>) | undefined;
  selectedDs: DesignSystem | null;
  selectedId: string;
  selectedPreset: TemplatePreset | undefined;
  setCategory: Dispatch<SetStateAction<Category>>;
  setSelectedId: Dispatch<SetStateAction<string>>;
}) {
  const { t } = useTranslation();
  return (
    <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
      {/* ── Header ── */}
      <div className="flex flex-shrink-0 items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <DialogTitle className="text-base font-bold tracking-tight">
            {t('settings.chooseTemplateLayout')}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs">
            {t('settings.uiTemplateBuilder')}
          </DialogDescription>
        </div>
        {selectedDs && (
          <div className="flex items-center gap-2">
            {/* Selected DS color strip */}
            <div className="flex items-center gap-1">
              {[
                selectedDs.colors.primary,
                selectedDs.colors.secondary,
                selectedDs.colors.accent,
                selectedDs.colors.background,
              ].map((c, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold leading-none">{selectedDs.name}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{selectedDs.tagline}</p>
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
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
        {/* Featured 2-col */}
        {featuredPresets.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                قالب‌های ویژه
              </h3>
              <span className="text-xs text-muted-foreground/60">
                — الهام گرفته از بهترین پلتفرم‌های آموزشی
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {featuredPresets.map((preset) => (
                <TemplateCard
                  key={preset.id}
                  preset={preset}
                  isActive={preset.id === activePresetId}
                  isSelected={preset.id === selectedId}
                  onSelect={() => setSelectedId(preset.id)}
                  onDelete={onDelete}
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
                  چیدمان‌های ساده
                </h3>
                <span className="text-xs text-muted-foreground/60">
                  — نقطه شروع‌های تمیز و همه‌کاره
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {classicPresets.map((preset) => (
                <TemplateCard
                  key={preset.id}
                  preset={preset}
                  isActive={preset.id === activePresetId}
                  isSelected={preset.id === selectedId}
                  onSelect={() => setSelectedId(preset.id)}
                  onDelete={onDelete}
                  large={false}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Layout className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm">هیچ قالبی در این دسته‌بندی وجود ندارد</p>
          </div>
        )}
      </div>

      {/* ── Design System token strip (shown when selection differs from active) ── */}
      {selectedDs && selectedId !== activePresetId && (
        <div className="flex flex-shrink-0 items-center gap-6 border-t bg-muted/30 px-6 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              سیستم طراحی
            </span>
          </div>
          {/* Color tokens */}
          <div className="flex items-center gap-3">
            {[
              { label: 'اصلی', color: selectedDs.colors.primary },
              { label: 'ثانوی', color: selectedDs.colors.secondary },
              { label: 'تأکیدی', color: selectedDs.colors.accent },
              { label: 'پس‌زمینه', color: selectedDs.colors.background },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="h-5 w-5 flex-shrink-0 rounded-md border border-white shadow-sm ring-1 ring-black/10"
                  style={{ background: color }}
                />
                <div>
                  <p className="text-[9px] leading-none text-muted-foreground">{label}</p>
                  <p className="font-mono text-[10px] font-medium leading-snug">{color}</p>
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
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              {SHADOW_LABEL[selectedDs.shape.shadow] ?? selectedDs.shape.shadow}
            </span>
          </div>
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className="flex flex-shrink-0 items-center justify-between border-t bg-background px-6 py-4">
        <p className="text-xs text-muted-foreground">
          {selectedId === activePresetId
            ? 'یک قالب دیگر انتخاب کنید تا تغییرات اعمال شود'
            : `اعمال "${selectedPreset ? formatPresetDisplayName(selectedPreset.name) : ''}" — شامل بلوک‌های چیدمان و توکن‌های طراحی`}
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
            {isApplying ? t('settings.applying') : t('settings.applyTemplate')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
