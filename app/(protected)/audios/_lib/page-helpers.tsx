import { type AccessControl } from '@/components/ui/access-control-badge';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

export const DEFAULT_AUDIO_BITRATES_KBPS: Record<string, number> = {
  'audio/mpeg': 128,
  'audio/mp3': 128,
  'audio/aac': 128,
  'audio/ogg': 96,
  'audio/wav': 1411,
  'audio/flac': 921,
  'audio/webm': 96,
};

export interface AudioItem {
  id: number;
  title: string;
  description?: string;
  filename?: string | null;
  url?: string;
  streaming_url?: string;
  publicUrl?: string;
  size?: number | null;
  mime_type?: string | null;
  metadata?: {
    duration?: number;
    [key: string]: unknown;
  } | null;
  duration?: number | null;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  academy_id?: string | null;
  access_control?: AccessControl;
}

export const formatDate = (isoDate: string | undefined, locale: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getAudioUrl = (audio: AudioItem) => {
  const source = audio.streaming_url ?? audio.publicUrl ?? '';
  if (!source) return '';
  if (source.startsWith('http')) return source;
  const normalizedSource = source.startsWith('/') ? source : `/${source}`;
  return `${getBrowserApiBaseUrl()}${normalizedSource}`;
};
