'use client';

import { useState, useRef, MouseEvent } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { DEFAULT_AUDIO_BITRATES_KBPS, AudioItem } from '../_lib/page-helpers';

export function useAudioPlayback() {
  const { t } = useTranslation();
  const [playingId, setPlayingId] = useState<number | null>(null);

  const [progressMap, setProgressMap] = useState<Record<number, number>>({});

  const [durationMap, setDurationMap] = useState<Record<number, number>>({});

  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});

  const getDurationSeconds = (audio: AudioItem) => {
    const stored = durationMap[audio.id];
    if (stored && stored > 0) return stored;
    const fallback = audio.metadata?.duration ?? audio.duration;
    if (fallback && fallback > 0) {
      return fallback;
    }

    if (audio.size) {
      const mime = audio.mime_type?.toLowerCase() ?? 'audio/mpeg';
      const bitrateKbps = DEFAULT_AUDIO_BITRATES_KBPS[mime] ?? 128;
      const bitrateBps = bitrateKbps * 1000;
      if (bitrateBps > 0) {
        return (audio.size * 8) / bitrateBps;
      }
    }

    return 0;
  };

  const handlePlayPause = (audio: AudioItem) => {
    const node = audioRefs.current[audio.id];
    if (!node) return;

    if (playingId && playingId !== audio.id) {
      const currentNode = audioRefs.current[playingId];
      if (currentNode) {
        currentNode.pause();
      }
    }

    if (node.paused) {
      node
        .play()
        .then(() => {
          setPlayingId(audio.id);
        })
        .catch((err) => {
          console.error('Failed to play audio:', err);
          toast.error(t('media.unableToPlayAudioFile'));
        });
    } else {
      node.pause();
      setPlayingId(null);
    }
  };

  const handleSeek = (audio: AudioItem, event: MouseEvent<HTMLDivElement>) => {
    const node = audioRefs.current[audio.id];
    if (!node) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const offsetX = isRtl ? rect.right - event.clientX : event.clientX - rect.left;
    const percent = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const durationSeconds = getDurationSeconds(audio);
    const newTime = durationSeconds * percent;

    node.currentTime = newTime;
    setProgressMap((prev) => ({
      ...prev,
      [audio.id]: newTime,
    }));
  };

  const registerAudioRef = (audio: AudioItem) => (element: HTMLAudioElement | null) => {
    audioRefs.current[audio.id] = element;

    if (!element) return;

    element.onloadedmetadata = () => {
      if (Number.isFinite(element.duration) && element.duration > 0) {
        setDurationMap((prev) => ({
          ...prev,
          [audio.id]: element.duration,
        }));
      }
    };

    element.ontimeupdate = () => {
      setProgressMap((prev) => ({
        ...prev,
        [audio.id]: element.currentTime,
      }));
    };

    element.onended = () => {
      setPlayingId((current) => (current === audio.id ? null : current));
      setProgressMap((prev) => ({
        ...prev,
        [audio.id]: 0,
      }));
      element.currentTime = 0;
    };
  };

  return {
    audioRefs,
    getDurationSeconds,
    handlePlayPause,
    handleSeek,
    playingId,
    progressMap,
    registerAudioRef,
    setDurationMap,
    setPlayingId,
    setProgressMap,
  };
}
