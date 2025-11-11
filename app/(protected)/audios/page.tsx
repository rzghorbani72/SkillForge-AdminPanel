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
  Clock
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
  'audio/wav': 1411, // Approx PCM
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
    return `${hrs}h ${remainingMins}m ${remainingSeconds}s`;
  }

  if (mins > 0) {
    return `${mins}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

const formatTimecode = (seconds?: number) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '00:00';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`;
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
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
      <EmptyState
        icon={<Music className="h-12 w-12" />}
        title="No School Selected"
        description="Please select a school from the header to manage audio files."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading audio files..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio Library</h1>
          <p className="text-muted-foreground">
            Manage audio content for {selectedSchool.name}
          </p>
        </div>
        <UploadAudioDialog
          onAudioUploaded={handleAudioUploaded}
          courses={courses}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Audio Files
          </CardTitle>
          <Music className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">{audios.length}</div>
          <p className="text-xs text-muted-foreground">{selectedSchool.name}</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Total size: {formatFileSize(totalSize)}</span>
            <span>Total duration: {formatDuration(totalDurationSeconds)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={fetchAudios}>
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={fetchAudios}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredAudios.length === 0 && !error ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Music className="mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">
                No audio files found
              </h3>
              <p>
                {searchTerm
                  ? 'No audio files match your search.'
                  : 'Upload your first audio file to get started.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAudios.map((audio) => {
            const totalDurationSeconds = getDurationSeconds(audio);
            const playedSeconds = progressMap[audio.id] ?? 0;
            const totalSizeBytes =
              typeof audio.size === 'number' && audio.size > 0
                ? audio.size
                : null;
            const playedSizeBytes =
              totalSizeBytes && totalDurationSeconds > 0
                ? Math.min(
                    totalSizeBytes,
                    (playedSeconds / totalDurationSeconds) * totalSizeBytes
                  )
                : null;
            const formattedTotalTime =
              totalDurationSeconds > 0
                ? formatTimecode(totalDurationSeconds)
                : '--:--';
            const formattedDurationText =
              totalDurationSeconds > 0
                ? formatDuration(totalDurationSeconds)
                : '--:--';

            return (
              <Card
                key={audio.id}
                className="transition-shadow hover:shadow-md sm:min-w-[25rem] "
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 text-lg">
                        {audio.title || 'Untitled audio'}
                      </CardTitle>
                      {audio.description && (
                        <CardDescription className="mt-1 line-clamp-2 text-sm">
                          {audio.description}
                        </CardDescription>
                      )}
                    </div>
                    {audio.access_control && (
                      <AccessControlBadge
                        accessControl={audio.access_control}
                        className="ml-2 text-xs"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <audio
                      ref={registerAudioRef(audio)}
                      src={getAudioUrl(audio)}
                      preload="metadata"
                      crossOrigin="use-credentials"
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="mr-1 h-4 w-4" />
                        {formatFileSize(audio.size)}
                      </span>
                      <Badge variant="outline">
                        {audio.mime_type?.toUpperCase() || 'AUDIO'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {formatDate(audio.created_at)}
                      </span>
                      <span className="text-xs uppercase">
                        {audio.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Duration: {formattedDurationText}</span>
                      {audio.filename && <span>File: {audio.filename}</span>}
                    </div>
                    {playedSizeBytes !== null && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Played size</span>
                        <span>{formatFileSize(playedSizeBytes)}</span>
                      </div>
                    )}
                    <div className="w-full space-y-2">
                      <div
                        className="group relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-muted"
                        onClick={(event) => handleSeek(audio, event)}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-primary transition-all group-hover:bg-primary/90"
                          style={{
                            width: `${Math.min(
                              100,
                              ((progressMap[audio.id] ?? 0) /
                                Math.max(getDurationSeconds(audio), 0.0001)) *
                                100
                            )}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>
                          {formatTimecode(progressMap[audio.id] ?? 0)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => handlePlayPause(audio)}
                        >
                          {playingId === audio.id ? (
                            <>
                              <Pause className="mr-1 h-3 w-3" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-1 h-3 w-3" />
                              Play
                            </>
                          )}
                        </Button>
                        <span>{formattedTotalTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
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
                            className="flex-1"
                            onClick={() => setViewAudio(audio)}
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditAudio(audio)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setDeleteAudio(audio)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio-description">Description</Label>
                <Textarea
                  id="audio-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">Publicly accessible</p>
                  <p className="text-xs text-muted-foreground">
                    Allow members of the school to access this audio file.
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
