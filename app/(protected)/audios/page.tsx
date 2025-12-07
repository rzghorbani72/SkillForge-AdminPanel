'use client';

import { useState, useEffect, useCallback, useRef, MouseEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Music,
  Search,
  Edit,
  Trash2,
  Play,
  Pause,
  FileText,
  Clock,
  X,
  SlidersHorizontal,
  Sparkles,
  Music2,
  Volume2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import UploadAudioDialog from '@/components/content/upload-audio-dialog';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface AccessControl {
  can_modify: boolean;
  can_delete: boolean;
  can_view: boolean;
  is_owner: boolean;
  user_role: string;
  user_permissions: string[];
}

const DEFAULT_AUDIO_BITRATES_KBPS: Record<string, number> = {
  'audio/mpeg': 128,
  'audio/mp3': 128,
  'audio/aac': 128,
  'audio/ogg': 96,
  'audio/wav': 1411,
  'audio/flac': 921,
  'audio/webm': 96
};

interface AudioItem {
  id: number;
  title: string;
  description?: string;
  filename?: string | null;
  url?: string;
  streaming_url?: string;
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
  school_id?: number | null;
  access_control?: AccessControl;
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return 'N/A';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return '--:--';
  const totalSeconds = Math.round(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  const remainingSeconds = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${remainingMins}m`;
  }

  return `${mins}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatTimecode = (seconds?: number) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '0:00';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getAudioUrl = (audio: AudioItem) => {
  const source = audio.streaming_url ?? audio.url ?? '';
  if (!source) return '';
  if (source.startsWith('http')) return source;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
  const normalizedSource = source.startsWith('/') ? source : `/${source}`;
  return `${apiBase}${normalizedSource}`;
};

export default function AudiosPage() {
  const { t, language } = useTranslation();
  const { selectedSchool } = useSchool();
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<AudioItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAudio, setViewAudio] = useState<AudioItem | null>(null);
  const [editAudio, setEditAudio] = useState<AudioItem | null>(null);
  const [deleteAudio, setDeleteAudio] = useState<AudioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [durationMap, setDurationMap] = useState<Record<number, number>>({});
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});

  const fetchAudios = useCallback(async () => {
    if (!selectedSchool) {
      setAudios([]);
      setCourses([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [audiosResponse, coursesResponse] = await Promise.all([
        apiClient.getAudios(),
        apiClient.getCourses({ school_id: selectedSchool.id })
      ]);

      const rawAudios: AudioItem[] = Array.isArray(audiosResponse)
        ? audiosResponse
        : Array.isArray((audiosResponse as any)?.data)
          ? (audiosResponse as any).data
          : [];

      const schoolAudios = rawAudios.filter(
        (audio) => !audio.school_id || audio.school_id === selectedSchool.id
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
      setAudios(schoolAudios);
      setDurationMap((prev) => {
        const next: Record<number, number> = {};
        schoolAudios.forEach((audio) => {
          const initialDuration =
            audio.metadata?.duration ?? audio.duration ?? prev[audio.id] ?? 0;
          next[audio.id] = initialDuration;
        });
        return next;
      });
      setProgressMap((prev) => {
        const next: Record<number, number> = {};
        schoolAudios.forEach((audio) => {
          next[audio.id] = prev[audio.id] ?? 0;
        });
        return next;
      });

      const availableCourses = coursesResponse?.courses ?? [];
      const schoolCourses = availableCourses.filter(
        (course: Course) => course.school_id === selectedSchool.id
      );
      setCourses(schoolCourses);
    } catch (err) {
      console.error('Error fetching audios:', err);
      setError('Failed to load audio files. Please try again.');
      ErrorHandler.handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedSchool) {
      fetchAudios();
    } else {
      setIsLoading(false);
    }
  }, [selectedSchool, fetchAudios]);

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
            audio.filename?.toLowerCase().includes(query)
        )
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
          toast.error('Unable to play audio file.');
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
    const clickX = event.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    const durationSeconds = getDurationSeconds(audio);
    const newTime = durationSeconds * percent;

    node.currentTime = newTime;
    setProgressMap((prev) => ({
      ...prev,
      [audio.id]: newTime
    }));
  };

  const registerAudioRef =
    (audio: AudioItem) => (element: HTMLAudioElement | null) => {
      audioRefs.current[audio.id] = element;

      if (!element) return;

      element.onloadedmetadata = () => {
        if (Number.isFinite(element.duration) && element.duration > 0) {
          setDurationMap((prev) => ({
            ...prev,
            [audio.id]: element.duration
          }));
        }
      };

      element.ontimeupdate = () => {
        setProgressMap((prev) => ({
          ...prev,
          [audio.id]: element.currentTime
        }));
      };

      element.onended = () => {
        setPlayingId((current) => (current === audio.id ? null : current));
        setProgressMap((prev) => ({
          ...prev,
          [audio.id]: 0
        }));
        element.currentTime = 0;
      };
    };

  const handleAudioUploaded = () => {
    fetchAudios();
  };

  const handleUpdateAudio = async () => {
    if (!editAudio) return;

    const trimmedTitle = editTitle.trim();
    if (trimmedTitle.length === 0) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsUpdating(true);
      await apiClient.updateAudio(editAudio.id, {
        title: trimmedTitle,
        description: editDescription.trim(),
        is_public: editIsPublic
      });
      toast.success('Audio updated successfully');
      setEditAudio(null);
      fetchAudios();
    } catch (err) {
      console.error('Error updating audio:', err);
      ErrorHandler.handleApiError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAudio = async () => {
    if (!deleteAudio) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteAudio(deleteAudio.id);
      toast.success('Audio deleted successfully');
      setDeleteAudio(null);
      fetchAudios();
    } catch (err) {
      console.error('Error deleting audio:', err);
      ErrorHandler.handleApiError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalSize = audios.reduce((sum, audio) => sum + (audio.size ?? 0), 0);
  const totalDurationSeconds = audios.reduce(
    (sum, audio) => sum + (audio.metadata?.duration ?? audio.duration ?? 0),
    0
  );

  if (!selectedSchool) {
    return (
      <div className="page-wrapper flex-1 p-6">
        <EmptyState
          icon={<Music className="h-10 w-10" />}
          title={t('media.noSchoolSelected')}
          description={t('media.selectSchoolToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('media.loadingAudio')} />;
  }

  return (
    <div
      className="page-wrapper flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="icon-container-success">
            <Music2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('media.audioLibrary')}
              </h1>
              <Badge
                variant="secondary"
                className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
              >
                <Sparkles className="me-1 h-3 w-3" />
                {audios.length} {t('media.files')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('media.manageAudio')} - {selectedSchool.name}
            </p>
          </div>
        </div>
        <UploadAudioDialog
          onAudioUploaded={handleAudioUploaded}
          courses={courses}
        />
      </div>

      {/* Stats Card */}
      <div
        className="fade-in-up grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: '0.1s' }}
      >
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('media.totalFiles')}
                </p>
                <p className="text-2xl font-bold">{audios.length}</p>
              </div>
              <div className="icon-container-primary">
                <Music className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('media.totalSize')}
                </p>
                <p className="text-2xl font-bold">
                  {formatFileSize(totalSize)}
                </p>
              </div>
              <div className="icon-container-info">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('media.totalDuration')}
                </p>
                <p className="text-2xl font-bold">
                  {formatDuration(totalDurationSeconds)}
                </p>
              </div>
              <div className="icon-container-warning">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div
        className="fade-in-up flex items-center gap-3"
        style={{ animationDelay: '0.15s' }}
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('media.searchAudio')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-xl border-border/50 bg-background/50 pe-10 ps-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={fetchAudios}
          className="rounded-xl border-border/50"
        >
          {t('media.refresh')}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t('media.error')}
            </CardTitle>
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
        <div
          className="fade-in-up flex flex-1 items-center justify-center p-6"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent blur-2xl" />
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
                <Music className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              {t('media.noAudioFound')}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchTerm
                ? t('media.noAudioMatch')
                : t('media.uploadFirstAudio')}
            </p>
          </div>
        </div>
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2">
          {filteredAudios.map((audio, index) => {
            const totalDurationSeconds = getDurationSeconds(audio);
            const playedSeconds = progressMap[audio.id] ?? 0;
            const progressPercent =
              totalDurationSeconds > 0
                ? (playedSeconds / totalDurationSeconds) * 100
                : 0;
            const isPlaying = playingId === audio.id;

            return (
              <Card
                key={audio.id}
                className={cn(
                  'group overflow-hidden border-border/50 transition-all duration-300',
                  'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5',
                  isPlaying && 'border-primary/30 ring-2 ring-primary/20'
                )}
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 text-base transition-colors group-hover:text-primary">
                        {audio.title || 'Untitled audio'}
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
                        className="ml-2 text-[10px]"
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
                    Your browser does not support the audio element.
                  </audio>

                  {/* Audio Player */}
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant={isPlaying ? 'default' : 'outline'}
                        className={cn(
                          'h-10 w-10 shrink-0 rounded-full transition-all',
                          isPlaying && 'bg-primary shadow-lg shadow-primary/25'
                        )}
                        onClick={() => handlePlayPause(audio)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="ml-0.5 h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 space-y-1">
                        <div
                          className="group/progress relative h-2 cursor-pointer overflow-hidden rounded-full bg-muted"
                          onClick={(event) => handleSeek(audio, event)}
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all group-hover/progress:bg-primary/90"
                            style={{
                              width: `${Math.min(100, progressPercent)}%`
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>{formatTimecode(playedSeconds)}</span>
                          <span>{formatTimecode(totalDurationSeconds)}</span>
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
                      {audio.mime_type?.split('/')[1]?.toUpperCase() || 'AUDIO'}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(audio.created_at)}
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
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                          Details
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
      )}

      {/* View Audio Dialog */}
      {viewAudio && (
        <Dialog
          open={!!viewAudio}
          onOpenChange={(open) => !open && setViewAudio(null)}
        >
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>{viewAudio.title}</DialogTitle>
              <DialogDescription>{viewAudio.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <audio controls className="w-full" src={getAudioUrl(viewAudio)}>
                Your browser does not support the audio element.
              </audio>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <span>File size: {formatFileSize(viewAudio.size)}</span>
                <span>
                  Duration:{' '}
                  {formatDuration(
                    viewAudio.metadata?.duration ?? viewAudio.duration
                  )}
                </span>
                <span>Type: {viewAudio.mime_type || 'AUDIO'}</span>
                <span>Uploaded: {formatDate(viewAudio.created_at)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAudio(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Audio Dialog */}
      {editAudio && (
        <Dialog
          open={!!editAudio}
          onOpenChange={(open) => !open && setEditAudio(null)}
        >
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <DialogTitle>Edit Audio</DialogTitle>
              <DialogDescription>
                Update the metadata for this audio file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-title">Title</Label>
                <Input
                  id="audio-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio-description">Description</Label>
                <Textarea
                  id="audio-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Publicly accessible</p>
                  <p className="text-xs text-muted-foreground">
                    Allow members of the store to access this audio file.
                  </p>
                </div>
                <Switch
                  checked={editIsPublic}
                  onCheckedChange={setEditIsPublic}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditAudio(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateAudio} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleteAudio && (
        <ConfirmDeleteModal
          open={!!deleteAudio}
          onOpenChange={(open) => !open && setDeleteAudio(null)}
          title={deleteAudio.title || `Audio #${deleteAudio.id}`}
          itemType="audio file"
          onConfirm={handleDeleteAudio}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
