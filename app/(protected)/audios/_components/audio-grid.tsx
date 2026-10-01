'use client';

import { MouseEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, Pause, FileText, Clock, Volume2 } from 'lucide-react';
import { AccessControlBadge, AccessControlActions } from '@/components/ui/access-control-badge';
import { formatDuration, formatFileSize } from '@/components/shared/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import { AudioItem, formatDate, getAudioUrl } from '../_lib/page-helpers';

export function AudioGrid({
  filteredAudios,
  getDurationSeconds,
  handlePlayPause,
  handleSeek,
  locale,
  playingId,
  progressMap,
  registerAudioRef,
  setDeleteAudio,
  setEditAudio,
  setViewAudio,
}: {
  filteredAudios: AudioItem[];
  getDurationSeconds: (audio: AudioItem) => number;
  handlePlayPause: (audio: AudioItem) => void;
  handleSeek: (audio: AudioItem, event: MouseEvent<HTMLDivElement>) => void;
  locale: string;
  playingId: number | null;
  progressMap: Record<number, number>;
  registerAudioRef: (audio: AudioItem) => (element: HTMLAudioElement | null) => void;
  setDeleteAudio: Dispatch<SetStateAction<AudioItem | null>>;
  setEditAudio: Dispatch<SetStateAction<AudioItem | null>>;
  setViewAudio: Dispatch<SetStateAction<AudioItem | null>>;
}) {
  const { t } = useTranslation();
  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2">
      {filteredAudios.map((audio, index) => {
        const totalDurationSeconds = getDurationSeconds(audio);
        const playedSeconds = progressMap[audio.id] ?? 0;
        const progressPercent =
          totalDurationSeconds > 0 ? (playedSeconds / totalDurationSeconds) * 100 : 0;
        const isPlaying = playingId === audio.id;

        return (
          <Card
            key={audio.id}
            className={cn(
              'group overflow-hidden border-border/50 transition-all duration-300',
              'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5',
              isPlaying && 'border-primary/30 ring-2 ring-primary/20',
            )}
            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1 text-base transition-colors group-hover:text-primary">
                    {audio.title || t('media.untitledAudio')}
                  </CardTitle>
                  {audio.description && (
                    <CardDescription className="mt-1 line-clamp-2 text-xs">
                      {audio.description}
                    </CardDescription>
                  )}
                </div>
                {audio.access_control && (
                  <AccessControlBadge
                    accessControl={audio.access_control}
                    className="ms-2 text-[10px]"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio
                ref={registerAudioRef(audio)}
                src={getAudioUrl(audio)}
                preload="metadata"
                crossOrigin="use-credentials"
              >
                {t('media.audioElementNotSupported')}
              </audio>

              {/* Audio Player */}
              <div className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant={isPlaying ? 'default' : 'outline'}
                    className={cn(
                      'h-10 w-10 shrink-0 rounded-full transition-all',
                      isPlaying && 'bg-primary shadow-lg shadow-primary/25',
                    )}
                    onClick={() => handlePlayPause(audio)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 translate-x-px" />
                    )}
                  </Button>
                  <div className="flex-1 space-y-1">
                    <div
                      className="group/progress relative h-2 cursor-pointer overflow-hidden rounded-full bg-muted"
                      onClick={(event) => handleSeek(audio, event)}
                    >
                      <div
                        className="absolute inset-y-0 start-0 rounded-full bg-primary transition-all group-hover/progress:bg-primary/90"
                        style={{
                          width: `${Math.min(100, progressPercent)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                      <span>{formatDuration(playedSeconds)}</span>
                      <span>{formatDuration(totalDurationSeconds)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Info */}
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {formatFileSize(audio.size)}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-[10px] font-semibold"
                >
                  {audio.mime_type?.split('/')[1]?.toUpperCase() || t('media.audioType')}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(audio.created_at, locale)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {audio.access_control ? (
                  <AccessControlActions
                    accessControl={audio.access_control}
                    onView={() => setViewAudio(audio)}
                    onEdit={() => setEditAudio(audio)}
                    onDelete={() => setDeleteAudio(audio)}
                    className="flex-1"
                  />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setViewAudio(audio)}
                    >
                      <Volume2 className="me-1.5 h-3.5 w-3.5" />
                      {t('media.details')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setEditAudio(audio)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => setDeleteAudio(audio)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
