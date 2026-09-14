'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionItemControls, moveItem } from './section-item-controls';

export interface SlideConfig {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
}

interface SlidesEditorProps {
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

function readSlides(cfg: Record<string, unknown>): SlideConfig[] {
  return Array.isArray(cfg.slides) ? (cfg.slides as SlideConfig[]) : [];
}

/** Slide list for the slideshow section: image + headline + one line of text. */
export function SlidesEditor({ cfg, set }: SlidesEditorProps) {
  const { t } = useTranslation();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const slides = readSlides(cfg);

  const write = (next: SlideConfig[]) => set('slides', next);

  const patch = (index: number, changes: Partial<SlideConfig>) =>
    write(slides.map((slide, i) => (i === index ? { ...slide, ...changes } : slide)));

  const handleUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingIndex(index);
      setProgress(0);
      const result = (await apiClient.uploadImage(file, { title: 'Slide' }, (percent) =>
        setProgress(percent),
      )) as unknown as Record<string, unknown>;
      const id =
        (result?.id as string | number | undefined) ??
        ((result?.data as Record<string, unknown>)?.id as string | number | undefined);
      if (id !== undefined) {
        patch(index, {
          backgroundImage: `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`,
        });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setUploadingIndex(null);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {t('sitePreview.slidesEditorTitle')}
        </span>
        <button
          type="button"
          onClick={() => write([...slides, {}])}
          className="flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          {t('sitePreview.slidesAdd')}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-500">{t('sitePreview.slidesCaption')}</p>

      {slides.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 py-4 text-center text-[11px] text-zinc-500">
          {t('sitePreview.slidesEmpty')}
        </p>
      ) : (
        slides.map((slide, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-600">{index + 1}</span>
              <SectionItemControls
                index={index}
                count={slides.length}
                onMove={(i, dir) => write(moveItem(slides, i, dir))}
                onRemove={(i) => write(slides.filter((_, j) => j !== i))}
              />
            </div>

            <label className="block cursor-pointer">
              {slide.backgroundImage ? (
                <span className="relative block">
                  <img
                    src={slide.backgroundImage}
                    alt=""
                    className="h-16 w-full rounded-md border border-zinc-200 object-cover"
                  />
                  {uploadingIndex === index && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 text-[11px] font-medium text-white">
                      {t('sitePreview.panelUploading')}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 py-3 text-[11px] text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-600">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingIndex === index
                    ? t('sitePreview.panelUploading')
                    : t('sitePreview.panelUploadImage')}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingIndex !== null}
                onChange={(event) => handleUpload(index, event)}
              />
            </label>

            {uploadingIndex === index && (
              <span className="block h-1 overflow-hidden rounded-full bg-zinc-200">
                <span
                  className="block h-full rounded-full bg-blue-500 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </span>
            )}

            <Input
              value={slide.title ?? ''}
              onChange={(event) => patch(index, { title: event.target.value })}
              placeholder={t('sitePreview.slideTitle')}
              className="h-8 border-zinc-300 bg-white text-xs"
            />
            <Input
              value={slide.subtitle ?? ''}
              onChange={(event) => patch(index, { subtitle: event.target.value })}
              placeholder={t('sitePreview.slideSubtitle')}
              className="h-8 border-zinc-300 bg-white text-xs"
            />
          </div>
        ))
      )}
    </div>
  );
}
