import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { UIBlockConfig } from '@/types/api';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { IMAGE_ACCEPT } from '@/lib/upload-limits';

export type HeroBgType = 'gradient' | 'solid' | 'image';

// Mirror of MEDIA_HEIGHT_BOUNDS / MEDIA_RATIOS in edusphere's hero-slideshow-slot.
export const MEDIA_HEIGHT_MIN = 120;

export const MEDIA_HEIGHT_MAX = 720;

export const MEDIA_HEIGHT_DEFAULT = 260;

export const MEDIA_RATIOS = ['free', '3:1', '21:9', '16:9', '4:3', '1:1', '9:16'] as const;

// ── Legacy hero background (non-gallery heroes only) ─────────────────────────

export function HeroBackground({
  block,
  cfg,
  set,
  onUpdate,
}: {
  block: UIBlockConfig;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onUpdate: (blockId: string, config: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const bgType: HeroBgType = (cfg.bgType as HeroBgType) ?? 'gradient';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await apiClient.uploadImage(file, {
        title: 'Hero Background',
      });
      const raw = result as unknown as Record<string, unknown>;
      const id =
        (raw?.id as number | undefined) ??
        ((raw?.data as Record<string, unknown>)?.id as number | undefined);
      if (id) {
        const url = `${getBrowserApiBaseUrl()}/images/get-image?id=${id}`;
        onUpdate(block.id, {
          bgImage: url,
          backgroundImage: url,
          bgType: 'image',
        });
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const bgOptions: { type: HeroBgType; label: string }[] = [
    { type: 'gradient', label: t('sitePreview.panelBgGradient') },
    { type: 'solid', label: t('sitePreview.panelBgSolid') },
    { type: 'image', label: t('sitePreview.panelBgImage') },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          {t('sitePreview.panelBackground')}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {bgOptions.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                // When switching to solid without an existing color, default
                // to the primary blue so the preview immediately shows solid.
                if (type === 'solid' && !cfg.bgColor) {
                  onUpdate(block.id, {
                    bgType: 'solid',
                    bgColor: '#3b82f6',
                  });
                } else {
                  set('bgType', type);
                }
              }}
              className={`rounded border py-1.5 text-xs font-medium transition-colors ${
                bgType === type
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {bgType === 'solid' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            title={t('sitePreview.panelBackground')}
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent"
          />
          <Input
            value={(cfg.bgColor as string) ?? '#3b82f6'}
            onChange={(e) => set('bgColor', e.target.value)}
            className="h-8 border-zinc-300 bg-zinc-100 font-mono text-xs text-zinc-900"
            placeholder="#3b82f6"
          />
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-2">
          {cfg.bgImage ? (
            <div className="group relative overflow-hidden rounded-md border border-zinc-200">
              <img
                src={cfg.bgImage as string}
                alt="Hero background"
                className="h-20 w-full object-cover"
              />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="ml-1 h-3.5 w-3.5" />
                {t('sitePreview.panelReplaceImage')}
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-4 text-xs text-zinc-600 transition-colors hover:border-blue-500 hover:text-blue-400">
              <Upload className="h-4 w-4" />
              {isUploading ? t('sitePreview.panelUploading') : t('sitePreview.panelUploadImage')}
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">{t('sitePreview.panelOverlayOpacity')}</span>
              <span className="text-xs text-zinc-700">{(cfg.overlayOpacity as number) ?? 40}%</span>
            </div>
            <input
              type="range"
              title={t('sitePreview.panelOverlayOpacity')}
              min={0}
              max={80}
              value={(cfg.overlayOpacity as number) ?? 40}
              onChange={(e) => set('overlayOpacity', Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
