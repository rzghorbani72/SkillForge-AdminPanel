'use client';

import { Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  useAcademyVideos,
  videoStreamPath
} from '@/lib/ui-template/use-academy-videos';

interface HeroVideoPickerProps {
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onUpdate: (config: Record<string, unknown>) => void;
  /** Banner heroes always loop muted, so the autoplay switch is hidden. */
  alwaysAutoplay?: boolean;
}

/**
 * Chooses a library video for the hero. Uploading a new one happens on the
 * canvas itself (the slot's upload button), so the sidebar only lists.
 */
export function HeroVideoPicker({
  cfg,
  set,
  onUpdate,
  alwaysAutoplay = false
}: HeroVideoPickerProps) {
  const { t } = useTranslation();
  const { videos, isLoading } = useAcademyVideos();
  const currentUrl =
    typeof cfg.heroVideoUrl === 'string' ? cfg.heroVideoUrl : null;
  const current = videos.find((v) => videoStreamPath(v) === currentUrl) ?? null;

  const pick = (videoId: string) => {
    const video = videos.find((item) => item.id === videoId);
    if (!video) return;
    onUpdate({
      heroVideoUrl: videoStreamPath(video),
      heroVideoPoster: video.poster_url ?? null
    });
  };

  const clear = () =>
    onUpdate({
      heroVideoUrl: null,
      heroVideoPoster: null,
      heroVideoAutoplay: false
    });

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {t('sitePreview.heroVideoTitle')}
      </span>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        {t('sitePreview.heroVideoHint')}
      </p>

      {currentUrl ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2">
            <span className="flex-1 truncate text-[11px] font-medium text-zinc-700">
              {current?.title ?? t('sitePreview.heroVideoSelected')}
            </span>
            <button
              type="button"
              onClick={clear}
              title={t('sitePreview.itemRemove')}
              aria-label={t('sitePreview.itemRemove')}
              className="rounded border border-red-300 p-1 text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {!alwaysAutoplay && (
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-2.5 py-2">
              <span className="text-xs text-zinc-700">
                {t('sitePreview.heroVideoAutoplay')}
              </span>
              <Switch
                checked={cfg.heroVideoAutoplay === true}
                onCheckedChange={(value) => set('heroVideoAutoplay', value)}
              />
            </div>
          )}
        </>
      ) : (
        <Select value="" onValueChange={pick} disabled={isLoading}>
          <SelectTrigger className="h-8 border-zinc-300 bg-white text-xs">
            <SelectValue placeholder={t('sitePreview.heroVideoPick')} />
          </SelectTrigger>
          <SelectContent>
            {videos.map((video) => (
              <SelectItem key={video.id} value={video.id} className="text-xs">
                {video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
