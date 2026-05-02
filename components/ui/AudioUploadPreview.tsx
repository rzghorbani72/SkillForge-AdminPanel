'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ErrorHandler } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

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
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/api`;
  const normalized = source.startsWith('/') ? source : `/${source}`;
  return `${apiBase}${normalized}`;
}

function parseAudioFromUploadResponse(res: unknown): AudioLike | null {
  const body = (res as { data?: { status?: string; data?: AudioLike } })?.data;
  if (!body) return null;
  const row = body.data;
  if (row && typeof row === 'object' && 'id' in row) {
    return row as AudioLike;
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
  descriptionFallback = 'Lesson audio',
  selectedAudioId,
  onSuccess,
  onClear,
  disabled = false,
  className = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [playUrl, setPlayUrl] = useState<string | null>(null);

  const loadExisting = useCallback(async (id: string) => {
    const n = parseInt(id, 10);
    if (Number.isNaN(n) || n <= 0) {
      setPlayUrl(null);
      return;
    }
    try {
      const data = await apiClient.getAudio(n);
      const a = data as AudioLike | null;
      if (a) {
        const url = resolvePlayUrl(a);
        setPlayUrl(url || null);
      } else {
        setPlayUrl(null);
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('audio/')) {
      toast.error('Please choose an audio file');
      return;
    }
    setFile(f);
    toast.success(`Selected: ${f.name}`);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Choose an audio file first');
      return;
    }
    setIsUploading(true);
    try {
      const res = await apiClient.uploadAudio(file, {
        title: lessonTitle?.trim() || file.name,
        description: descriptionFallback
      });
      const audio = parseAudioFromUploadResponse(res);
      const id = audio?.id;
      if (!id) {
        toast.error('Upload succeeded but no audio id was returned');
        return;
      }
      const url = audio ? resolvePlayUrl(audio) : '';
      onSuccess({ id, publicUrl: url || null });
      if (url) setPlayUrl(url);
      setFile(null);
      toast.success('Audio uploaded and linked to this lesson');
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPlayUrl(null);
    onClear?.();
  };

  const hasSelection =
    Boolean(selectedAudioId && String(selectedAudioId).trim() !== '') ||
    Boolean(playUrl);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Input
          type="file"
          accept="audio/*,.mp3,.wav,.aac,.ogg,.m4a,.flac"
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          MP3, WAV, AAC, OGG, M4A, FLAC (max 50MB on server)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleUpload()}
          disabled={!file || isUploading || disabled}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & attach
            </>
          )}
        </Button>
        {hasSelection ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={disabled || isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Remove audio
          </Button>
        ) : null}
      </div>

      {playUrl ? (
        <audio key={playUrl} controls className="w-full max-w-md" src={playUrl}>
          Your browser does not support audio playback.
        </audio>
      ) : null}
    </div>
  );
};

export default AudioUploadPreview;
