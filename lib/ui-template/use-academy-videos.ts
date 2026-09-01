'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

export interface LibraryVideo {
  id: string;
  title: string;
  streaming_url?: string;
  poster_url?: string | null;
}

/** Relative stream path — edusphere resolves it against the API origin. */
export function videoStreamPath(video: LibraryVideo): string {
  return video.streaming_url ?? `/videos/stream/${video.id}`;
}

/**
 * The academy's uploaded videos, for the site-builder controls that pick one.
 * Uploading stays in the Content area so every video goes through the
 * quota-checked upload path.
 */
export function useAcademyVideos() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getVideos()
      .then((data: unknown) => {
        if (cancelled) return;
        setVideos(Array.isArray(data) ? (data as LibraryVideo[]) : []);
      })
      .catch((error) => {
        if (!cancelled) ErrorHandler.handleApiError(error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { videos, isLoading };
}
