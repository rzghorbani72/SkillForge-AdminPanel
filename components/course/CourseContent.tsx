'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Layers,
  Loader2,
  Lock,
  Mic,
  Save,
  Unlock,
  Video,
  FileText,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import type { Course, Season } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonMedia {
  id: number;
  publicUrl: string;
  title?: string;
  alt?: string;
}

interface RichLesson {
  id: number;
  title: string;
  description: string;
  order: number;
  is_free: boolean;
  is_published: boolean;
  lesson_type: string;
  Video?: LessonMedia | null;
  Audio?: LessonMedia | null;
  Document?: LessonMedia | null;
  Image?: LessonMedia | null;
}

// ─── Progress bar (imperative width to avoid inline-style lint) ───────────────

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        ref={ref}
        className="h-full bg-primary transition-all duration-200"
      />
    </div>
  );
}

// ─── Reusable upload zone ─────────────────────────────────────────────────────

function UploadZone({
  accept,
  uploading,
  onFile,
  icon: Icon,
  label
}: {
  accept: string;
  uploading: boolean;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  label: string;
}) {
  if (uploading) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onFile}
      />
    </label>
  );
}

// ─── Lesson editor ────────────────────────────────────────────────────────────

function LessonReadOnly({ lesson }: { lesson: RichLesson }) {
  return (
    <div className="space-y-4 px-4 pb-4 pt-3">
      {lesson.description && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {lesson.description}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {lesson.Video?.publicUrl && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Video</p>
            <div className="relative overflow-hidden rounded-md border bg-black/5">
              <video
                src={lesson.Video.publicUrl}
                className="aspect-video w-full rounded-md object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-7 w-7 text-white/80 drop-shadow" />
              </div>
            </div>
          </div>
        )}
        {lesson.Audio?.publicUrl && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Audio</p>
            <audio src={lesson.Audio.publicUrl} controls className="w-full" />
          </div>
        )}
        {lesson.Image?.publicUrl && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Cover</p>
            <img
              src={lesson.Image.publicUrl}
              alt={lesson.title}
              className="aspect-video w-full rounded-md object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Badge
          variant={lesson.is_free ? 'outline' : 'secondary'}
          className={
            lesson.is_free ? 'border-emerald-300 text-emerald-600' : ''
          }
        >
          {lesson.is_free ? (
            <>
              <Unlock className="mr-1 h-3 w-3" />
              Free preview
            </>
          ) : (
            <>
              <Lock className="mr-1 h-3 w-3" />
              Paid
            </>
          )}
        </Badge>
        <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
          {lesson.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>
    </div>
  );
}

function LessonEditor({ lesson }: { lesson: RichLesson }) {
  const [draft, setDraft] = useState({ ...lesson });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoAbortRef = useRef<AbortController | null>(null);

  function patch(update: Partial<typeof draft>) {
    setDraft((d) => ({ ...d, ...update }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.updateLesson(draft.id, {
        title: draft.title.trim(),
        description: draft.description?.trim() || undefined,
        is_free: draft.is_free,
        published: draft.is_published,
        video_id: draft.Video?.id ?? null,
        audio_id: draft.Audio?.id ?? null,
        cover_id: draft.Image?.id ?? null,
        document_id: draft.Document?.id ?? null
      });
      toast.success('Lesson saved');
      setDirty(false);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const abort = new AbortController();
    videoAbortRef.current = abort;
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const result = await apiClient.uploadVideoWithProgress(
        file,
        { title: draft.title || file.name },
        undefined,
        setVideoProgress,
        abort
      );
      const data = (result as any)?.data ?? result;
      const id = (data as any)?.id as number | undefined;
      const publicUrl = ((data as any)?.publicUrl as string) ?? '';
      if (id) patch({ Video: { id, publicUrl, title: file.name } });
    } catch (err) {
      if ((err as Error).message !== 'Upload cancelled')
        ErrorHandler.handleApiError(err);
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      videoAbortRef.current = null;
      e.target.value = '';
    }
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const result = await apiClient.uploadAudio(file, {
        title: draft.title || file.name
      });
      const data = (result as any)?.data ?? result;
      const id = (data as any)?.id as number | undefined;
      const publicUrl = ((data as any)?.publicUrl as string) ?? '';
      if (id) patch({ Audio: { id, publicUrl, title: file.name } });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: draft.title || file.name
      });
      const data = (result as any)?.data ?? result;
      const id = (data as any)?.id as number | undefined;
      const publicUrl = ((data as any)?.publicUrl as string) ?? '';
      if (id) patch({ Image: { id, publicUrl } });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const result = await apiClient.uploadDocument(file, {
        title: draft.title || file.name
      });
      const data = (result as any)?.data ?? result;
      const id = (data as any)?.id as number | undefined;
      const publicUrl = ((data as any)?.publicUrl as string) ?? '';
      if (id) patch({ Document: { id, publicUrl, title: file.name } });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-5 px-4 pb-4 pt-3">
      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <textarea
          value={draft.description ?? ''}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Lesson description (optional)"
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Video + Audio + Cover — 3 columns */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Video */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Video</Label>
          {draft.Video?.publicUrl ? (
            <div className="relative overflow-hidden rounded-md border bg-black/5">
              <video
                src={draft.Video.publicUrl}
                className="aspect-video w-full rounded-md object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-7 w-7 text-white/80 drop-shadow" />
              </div>
              <button
                type="button"
                aria-label="Remove video"
                onClick={() => patch({ Video: null })}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : uploadingVideo ? (
            <div className="space-y-2 rounded-md border border-dashed p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </span>
                <button
                  type="button"
                  onClick={() => videoAbortRef.current?.abort()}
                >
                  Cancel
                </button>
              </div>
              <ProgressBar value={videoProgress} />
            </div>
          ) : (
            <UploadZone
              accept="video/*"
              uploading={false}
              onFile={handleVideoUpload}
              icon={Video}
              label="Upload video"
            />
          )}
        </div>

        {/* Audio */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Audio / Voice</Label>
          {draft.Audio?.publicUrl ? (
            <div className="relative rounded-md border px-3 py-2">
              <audio src={draft.Audio.publicUrl} controls className="w-full" />
              <button
                type="button"
                aria-label="Remove audio"
                onClick={() => patch({ Audio: null })}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <UploadZone
              accept="audio/*"
              uploading={uploadingAudio}
              onFile={handleAudioUpload}
              icon={Mic}
              label="Upload audio"
            />
          )}
        </div>

        {/* Cover image */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Cover Image</Label>
          {draft.Image?.publicUrl ? (
            <div className="relative overflow-hidden rounded-md border">
              <img
                src={draft.Image.publicUrl}
                alt={draft.title}
                className="aspect-video w-full object-cover"
              />
              <button
                type="button"
                aria-label="Remove cover image"
                onClick={() => patch({ Image: null })}
                className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <UploadZone
              accept="image/*"
              uploading={uploadingImage}
              onFile={handleImageUpload}
              icon={ImageIcon}
              label="Upload image"
            />
          )}
        </div>
      </div>

      {/* File attachment */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          Attachment (PDF / doc / zip)
        </Label>
        {draft.Document ? (
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {draft.Document.title || 'Attached file'}
              </span>
            </div>
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => patch({ Document: null })}
              className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingFile ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading…
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40">
            <FileText className="h-4 w-4" />
            Choose file
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip,.pptx"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </label>
        )}
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6 border-t pt-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Switch
            checked={draft.is_free}
            onCheckedChange={(v) => patch({ is_free: v })}
          />
          <span className="flex items-center gap-1 text-sm">
            {draft.is_free ? (
              <Unlock className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {draft.is_free ? 'Free preview' : 'Paid'}
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <Switch
            checked={draft.is_published}
            onCheckedChange={(v) => patch({ is_published: v })}
          />
          <span className="text-sm">
            {draft.is_published ? 'Published' : 'Draft'}
          </span>
        </label>
      </div>

      {/* Save */}
      {dirty && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            Save lesson
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Lesson row (collapsible) ─────────────────────────────────────────────────

function LessonRow({
  lesson,
  index,
  readOnly
}: {
  lesson: RichLesson;
  index: number;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-border/50 bg-background/60">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
          {index + 1}
        </span>
        <span className="flex-1 truncate text-sm font-medium">
          {lesson.title || 'Untitled lesson'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {lesson.Video && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
              <Video className="h-2.5 w-2.5" />
            </Badge>
          )}
          {lesson.Audio && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
              <Mic className="h-2.5 w-2.5" />
            </Badge>
          )}
          {lesson.is_free && (
            <Badge
              variant="outline"
              className="h-5 border-emerald-300 px-1.5 text-[10px] text-emerald-600"
            >
              Free
            </Badge>
          )}
          {lesson.is_published ? (
            <Badge className="h-5 px-1.5 text-[10px]">Live</Badge>
          ) : (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Draft
            </Badge>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t">
          {readOnly ? (
            <LessonReadOnly lesson={lesson} />
          ) : (
            <LessonEditor lesson={lesson} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Season accordion ─────────────────────────────────────────────────────────

function SeasonAccordion({
  season,
  index,
  readOnly
}: {
  season: Season & { Lesson?: RichLesson[] };
  index: number;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(true);
  const lessons: RichLesson[] = (season as any).Lesson ?? season.lessons ?? [];

  return (
    <div className="rounded-lg border border-border/60 bg-card/40">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 text-sm font-semibold">
          Season {index + 1}
          {season.title ? ` — ${season.title}` : ''}
        </span>
        <span className="text-xs text-muted-foreground">
          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t px-4 pb-4 pt-3">
          {lessons.length === 0 ? (
            <p className="rounded border border-dashed px-3 py-3 text-center text-xs text-muted-foreground">
              No lessons in this season
            </p>
          ) : (
            lessons.map((lesson, li) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                index={li}
                readOnly={readOnly}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { course: Course; readOnly?: boolean };

export default function CourseContent({ course, readOnly = false }: Props) {
  const seasons: (Season & { Lesson?: RichLesson[] })[] =
    (course as any).Season ?? course.seasons ?? [];

  const totalLessons = seasons.reduce(
    (sum, s) => sum + ((s as any).Lesson?.length ?? s.lessons?.length ?? 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Content</CardTitle>
          {seasons.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {seasons.length} season{seasons.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {seasons.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No seasons yet — edit the course to add content.
          </p>
        ) : (
          seasons.map((season, si) => (
            <SeasonAccordion
              key={season.id}
              season={season}
              index={si}
              readOnly={readOnly}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
