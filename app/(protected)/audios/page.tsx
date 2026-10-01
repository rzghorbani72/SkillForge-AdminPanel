'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Clock, HardDrive, Music2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { UploadMediaDialog } from '@/components/content/upload-media-dialog';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StatsCard } from '@/components/shared/stats-card';
import { formatDuration, formatFileSize } from '@/components/shared/utils';
import { formatNumber } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import { EditAudioDialog } from './_components/edit-audio-dialog';
import { AudioGrid } from './_components/audio-grid';
import { useAudioPlayback } from './_hooks/use-audio-playback';
import { useAudioEditing } from './_hooks/use-audio-editing';
import { AudioItem, formatDate, getAudioUrl } from './_lib/page-helpers';

export default function AudiosPage() {
  const { t, language } = useTranslation();
  const locale = getLocaleForLanguage(language);
  const { selectedAcademy } = useStore();
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<AudioItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAudio, setViewAudio] = useState<AudioItem | null>(null);

  const {
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
  } = useAudioPlayback();

  const fetchAudios = useCallback(async () => {
    if (!selectedAcademy) {
      setAudios([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const audiosResponse = await apiClient.getAudios();

      const rawAudios: AudioItem[] = Array.isArray(audiosResponse)
        ? audiosResponse
        : Array.isArray((audiosResponse as any)?.data)
          ? (audiosResponse as any).data
          : [];

      const storeAudios = rawAudios.filter(
        (audio) => !audio.academy_id || audio.academy_id === selectedAcademy.id,
      );

      setPlayingId((current) => {
        if (current !== null) {
          const node = audioRefs.current[current];
          if (node) {
            node.pause();
            node.currentTime = 0;
          }
        }
        return null;
      });
      setAudios(storeAudios);
      setDurationMap((prev) => {
        const next: Record<number, number> = {};
        storeAudios.forEach((audio) => {
          const initialDuration = audio.metadata?.duration ?? audio.duration ?? prev[audio.id] ?? 0;
          next[audio.id] = initialDuration;
        });
        return next;
      });
      setProgressMap((prev) => {
        const next: Record<number, number> = {};
        storeAudios.forEach((audio) => {
          next[audio.id] = prev[audio.id] ?? 0;
        });
        return next;
      });
    } catch (err) {
      setError(t('media.failedToLoadAudioFiles'));
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademy]);

  const {
    deleteAudio,
    editAudio,
    editDescription,
    editIsPublic,
    editTitle,
    handleDeleteAudio,
    handleUpdateAudio,
    isDeleting,
    isUpdating,
    setDeleteAudio,
    setEditAudio,
    setEditDescription,
    setEditIsPublic,
    setEditTitle,
  } = useAudioEditing({ fetchAudios });

  useEffect(() => {
    if (selectedAcademy) {
      fetchAudios();
    } else {
      setIsLoading(false);
    }
  }, [selectedAcademy, fetchAudios]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAudios(audios);
    } else {
      const query = searchTerm.toLowerCase();
      setFilteredAudios(
        audios.filter(
          (audio) =>
            audio.title?.toLowerCase().includes(query) ||
            audio.description?.toLowerCase().includes(query) ||
            audio.filename?.toLowerCase().includes(query),
        ),
      );
    }
  }, [audios, searchTerm]);

  useEffect(() => {
    if (editAudio) {
      setEditTitle(editAudio.title ?? '');
      setEditDescription(editAudio.description ?? '');
      setEditIsPublic(editAudio.is_public ?? true);
    }
  }, [editAudio]);

  const handleAudioUploaded = () => {
    fetchAudios();
  };

  const totalSize = audios.reduce((sum, audio) => sum + (audio.size ?? 0), 0);
  const totalDurationSeconds = audios.reduce(
    (sum, audio) => sum + (audio.metadata?.duration ?? audio.duration ?? 0),
    0,
  );

  if (!selectedAcademy) {
    return (
      <div className="page-wrapper flex-1 p-4 sm:p-6">
        <EmptyState
          icon={<Music className="h-10 w-10" />}
          title={t('media.noStoreSelected')}
          description={t('media.selectStoreToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingAudio')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={<Music2 className="h-5 w-5" />}
        title={t('media.audioLibrary')}
        description={`${t('media.manageAudio')} — ${selectedAcademy.name}`}
        badge={`${formatNumber(audios.length)} ${t('media.files')}`}
      >
        <UploadMediaDialog kind="audio" onUploaded={handleAudioUploaded} />
      </PageHeader>

      {/* Stats */}
      <div className="fade-in-up grid gap-4 sm:grid-cols-3" style={{ animationDelay: '0.1s' }}>
        <StatsCard icon={Music} title={t('media.totalFiles')} value={formatNumber(audios.length)} />
        <StatsCard
          icon={HardDrive}
          title={t('media.totalSize')}
          value={formatFileSize(totalSize)}
          iconColor="text-amber-600"
        />
        <StatsCard
          icon={Clock}
          title={t('media.totalDuration')}
          value={formatDuration(totalDurationSeconds)}
          iconColor="text-sky-600"
        />
      </div>

      {/* Search */}
      <div className="fade-in-up flex items-center gap-3" style={{ animationDelay: '0.15s' }}>
        <SearchBar
          placeholder={t('media.searchAudio')}
          value={searchTerm}
          onChange={setSearchTerm}
          className="max-w-md flex-1"
        />
        <Button
          variant="outline"
          onClick={fetchAudios}
          className="h-10 shrink-0 rounded-xl border-border/50"
        >
          {t('media.refresh')}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">{t('media.error')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={fetchAudios}>
              {t('media.retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audio Grid */}
      {filteredAudios.length === 0 && !error ? (
        <EmptyState
          className="fade-in-up"
          icon={<Music className="h-10 w-10" />}
          title={t('media.noAudioFound')}
          description={searchTerm ? t('media.noAudioMatch') : t('media.uploadFirstAudio')}
        />
      ) : (
        <AudioGrid
          filteredAudios={filteredAudios}
          getDurationSeconds={getDurationSeconds}
          handlePlayPause={handlePlayPause}
          handleSeek={handleSeek}
          locale={locale}
          playingId={playingId}
          progressMap={progressMap}
          registerAudioRef={registerAudioRef}
          setDeleteAudio={setDeleteAudio}
          setEditAudio={setEditAudio}
          setViewAudio={setViewAudio}
        />
      )}

      {/* View Audio Dialog */}
      {viewAudio && (
        <Dialog open={!!viewAudio} onOpenChange={(open) => !open && setViewAudio(null)}>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>{viewAudio.title}</DialogTitle>
              <DialogDescription>{viewAudio.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <audio controls className="w-full" src={getAudioUrl(viewAudio)}>
                {t('media.audioElementNotSupported')}
              </audio>
              <div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground sm:grid-cols-2">
                <span>
                  {t('media.fileSize')}: {formatFileSize(viewAudio.size)}
                </span>
                <span>
                  {t('media.duration')}:{' '}
                  {formatDuration(viewAudio.metadata?.duration ?? viewAudio.duration)}
                </span>
                <span>
                  {t('media.type')}: {viewAudio.mime_type || t('media.audioType')}
                </span>
                <span>
                  {t('media.uploaded')}: {formatDate(viewAudio.created_at, locale)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAudio(null)}>
                {t('media.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Audio Dialog */}
      {editAudio && (
        <EditAudioDialog
          editAudio={editAudio}
          editDescription={editDescription}
          editIsPublic={editIsPublic}
          editTitle={editTitle}
          handleUpdateAudio={handleUpdateAudio}
          isUpdating={isUpdating}
          setEditAudio={setEditAudio}
          setEditDescription={setEditDescription}
          setEditIsPublic={setEditIsPublic}
          setEditTitle={setEditTitle}
        />
      )}

      {/* Delete Confirmation */}
      {deleteAudio && (
        <ConfirmDeleteModal
          open={!!deleteAudio}
          onOpenChange={(open) => !open && setDeleteAudio(null)}
          title={deleteAudio.title || `${t('media.audioLabel')} #${String(deleteAudio.id)}`}
          itemType={t('media.audioFile')}
          onConfirm={handleDeleteAudio}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
