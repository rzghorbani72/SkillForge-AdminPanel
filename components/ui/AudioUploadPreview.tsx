'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Music } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';
import { useTranslation } from '@/lib/i18n/hooks';
import { ErrorHandler } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import MediaDropzone from './media-dropzone';

const AUDIO_ACCEPT = 'audio/*,.mp3,.wav,.aac,.ogg,.m4a,.flac';

type AudioLike = {
  id?: number;
  streaming_url?: string | null;
  publicUrl?: string | null;
  url?: string | null;
  title?: string | null;
};

function resolvePlayUrl(audio: AudioLike): string {
  const source = audio.streaming_url ?? audio.publicUrl ?? audio.url ?? '';
  if (!source) return '';
  if (source.startsWith('http')) return source;
  const normalized = source.startsWith('/') ? source : `/${source}`;
  return `${getBrowserApiBaseUrl()}${normalized}`;
}

function parseAudioFromUploadResponse(res: unknown): AudioLike | null {
  const body = (res as { data?: { status?: string; data?: AudioLike } })?.data;
  const row = body?.data;
  if (row && typeof row === 'object' && 'id' in row) {
    return row;
  }
  return null;
}

export interface AudioUploadPreviewProps {
  lessonTitle?: string;
  descriptionFallback?: string;
  selectedAudioId?: string | null;
  onSuccess: (audio: { id: number; publicUrl?: string | null }) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

const AudioUploadPreview: React.FC<AudioUploadPreviewProps> = ({
  lessonTitle,
  descriptionFallback,
  selectedAudioId,
  onSuccess,
  onClear,
  disabled = false,
  className
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  const loadExisting = useCallback(async (id: string) => {
    const n = parseInt(id, 10);
    if (Number.isNaN(n) || n <= 0) {
      setPlayUrl(null);
      return;
    }
    try {
      const audio = (await apiClient.getAudio(n)) as AudioLike | null;
      setPlayUrl(audio ? resolvePlayUrl(audio) || null : null);
    } catch {
      setPlayUrl(null);
    }
  }, []);

  useEffect(() => {
    if (selectedAudioId && String(selectedAudioId).trim() !== '') {
      void loadExisting(String(selectedAudioId));
    } else {
      setPlayUrl(null);
    }
  }, [selectedAudioId, loadExisting]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error(tNow('toasts.audioChooseFile'));
      return;
    }
    setIsUploading(true);
    try {
      const res = await apiClient.uploadAudio(file, {
        title: lessonTitle?.trim() || file.name,
        description: descriptionFallback ?? file.name
      });
      const audio = parseAudioFromUploadResponse(res);
      const id = audio?.id;
      if (!id) {
        toast.error(tNow('toasts.audioBadResponse'));
        return;
      }
      const url = resolvePlayUrl(audio);
      onSuccess({ id, publicUrl: url || null });
      setPlayUrl(url || null);
      toast.success(tNow('toasts.audioUploaded'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPlayUrl(null);
    onClear?.();
  };

  const hasAudio =
    Boolean(selectedAudioId && String(selectedAudioId).trim() !== '') ||
    Boolean(playUrl);

  return (
    <MediaDropzone
      className={cn(className)}
      accept={AUDIO_ACCEPT}
      icon={<Music className="h-8 w-8 text-muted-foreground" />}
      placeholderText={t('media.noAudioSelected')}
      placeholderSubtext={t('media.dropAudioHint')}
      isUploading={isUploading}
      disabled={disabled}
      onFile={(file) => void handleFile(file)}
      onRemove={handleRemove}
      filled={
        hasAudio ? (
          <div className="space-y-2">
            {playUrl ? (
              <audio key={playUrl} controls className="w-full" src={playUrl} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('media.audioFile')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('media.audioFileHint')}
            </p>
          </div>
        ) : null
      }
    />
  );
};

export default AudioUploadPreview;
