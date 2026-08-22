'use client';

import { useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

type UseVideoCoverReturn = {
  /** Cover picked: store it on the video row when a video is already attached. */
  onCoverPicked: (file: File, videoId?: string | null) => void;
  /** Video attached: apply the cover picked before the upload finished. */
  onVideoAttached: (videoId: string) => void;
};

/**
 * The lesson cover doubles as the video poster, so the same image is saved on
 * the Video row — the player then shows it before playback everywhere.
 */
export function useVideoCover(): UseVideoCoverReturn {
  const coverFile = useRef<File | null>(null);

  const attach = useCallback(async (videoId: string, file: File) => {
    try {
      await apiClient.attachVideoPoster(videoId, file);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  }, []);

  const onCoverPicked = useCallback(
    (file: File, videoId?: string | null) => {
      coverFile.current = file;
      if (videoId) void attach(videoId, file);
    },
    [attach]
  );

  const onVideoAttached = useCallback(
    (videoId: string) => {
      if (coverFile.current) void attach(videoId, coverFile.current);
    },
    [attach]
  );

  return { onCoverPicked, onVideoAttached };
}
