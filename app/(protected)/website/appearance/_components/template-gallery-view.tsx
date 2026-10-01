'use client';

import { LayoutTemplate, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TemplatePreset } from '@/types/api';
import { formatPresetDisplayName } from '@/lib/ui-template/preset-source';
import { TemplateSection } from '@/components/ui-template/gallery-cards';
import { CATEGORY_LABELS, type TemplateCategory } from '@/constants/template-names';
import type { Dispatch, SetStateAction, JSX } from 'react';
import { PendingSave } from '@/app/(protected)/website/appearance/_components/appearance-workspace';

export function TemplateGalleryView({
  academyPresets,
  activePreset,
  activePresetId,
  categoryFilter,
  confirmDialog,
  filteredPlatform,
  galleryPreviewToken,
  galleryStorefrontUrl,
  getBaseCover,
  handleRate,
  openTemplate,
  platformPresets,
  presets,
  setCategoryFilter,
  setPendingSave,
  setPresets,
}: {
  academyPresets: TemplatePreset[];
  activePreset: TemplatePreset | null;
  activePresetId: string;
  categoryFilter: TemplateCategory | 'all';
  confirmDialog: JSX.Element | null;
  filteredPlatform: TemplatePreset[];
  galleryPreviewToken: string | null;
  galleryStorefrontUrl: string | null;
  getBaseCover: (preset: TemplatePreset) => string | undefined;
  handleRate: (preset: TemplatePreset, stars: number | null) => Promise<void>;
  openTemplate: (preset: TemplatePreset) => void;
  platformPresets: TemplatePreset[];
  presets: TemplatePreset[];
  setCategoryFilter: Dispatch<SetStateAction<TemplateCategory | 'all'>>;
  setPendingSave: Dispatch<SetStateAction<PendingSave | null>>;
  setPresets: Dispatch<SetStateAction<TemplatePreset[]>>;
}) {
  return (
    <div className="min-h-full bg-[#f7faf9] p-8" dir="rtl">
      {confirmDialog}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">قالب‌های آماده</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            یک قالب کامل فارسی انتخاب کنید تا پیش‌نمایش کامل ببینید — مستقیم روی آن کلیک کنید
          </p>
        </div>
      </div>

      {/* Currently live callout */}
      {activePreset && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-emerald-500" />
          <div className="flex-1">
            <p
              title={activePreset.name}
              className="truncate text-sm font-semibold text-emerald-900"
            >
              قالب فعلی: {formatPresetDisplayName(activePreset.name)}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-emerald-300 text-xs text-emerald-800"
            onClick={() => openTemplate(activePreset)}
          >
            <Pencil className="h-3.5 w-3.5" />
            ویرایش
          </Button>
        </div>
      )}

      {/* Category filter bar */}
      {platformPresets.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORY_LABELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                categoryFilter === value
                  ? 'bg-foreground text-background'
                  : 'border border-border/60 bg-background text-muted-foreground hover:bg-muted/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {presets.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 px-6 text-center">
          <LayoutTemplate className="mb-4 h-10 w-10 text-muted-foreground/60" />
          <h2 className="text-lg font-semibold text-foreground">هنوز قالبی تعریف نشده</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            کاتالوگ قالب‌های آماده خالی است. پس از افزودن قالب‌های جدید، اینجا نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {academyPresets.length > 0 && (
            <TemplateSection
              title="قالب‌های آکادمی من"
              description="نسخه‌های سفارشی‌شدهٔ شما. فقط برای همین آکادمی دیده می‌شوند."
              presets={academyPresets}
              activePresetId={activePresetId}
              previewToken={galleryPreviewToken}
              storefrontBaseUrl={galleryStorefrontUrl}
              getBaseCover={getBaseCover}
              onSelect={openTemplate}
              onQuickApply={(preset) => setPendingSave({ kind: 'quickApply', preset })}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
              onRate={handleRate}
            />
          )}
          {filteredPlatform.length > 0 && (
            <TemplateSection
              title="قالب‌های اصلی"
              description="کاتالوگ آمادهٔ پلتفرم. سفارشی‌سازی و ذخیره، نسخهٔ اختصاصی خودتان را می‌سازد."
              presets={filteredPlatform}
              activePresetId={activePresetId}
              onSelect={openTemplate}
              onQuickApply={(preset) => setPendingSave({ kind: 'quickApply', preset })}
              onDelete={(preset) => setPendingSave({ kind: 'delete', preset })}
              onRate={handleRate}
              onCoverUploaded={(preset, url) =>
                setPresets((current) =>
                  current.map((p) => (p.id === preset.id ? { ...p, preview: url } : p)),
                )
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
