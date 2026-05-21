'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ImageIcon,
  Loader2,
  Mic,
  Plus,
  Trash2,
  Video,
  X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { LessonDraft, SeasonDraft } from './useCourseForm';

// ─── Video progress bar ───────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return <div ref={ref} className="h-full bg-primary transition-all" />;
}

// ─── Lesson media upload (video + cover image) ────────────────────────────────

interface LessonMediaProps {
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
}

function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoAbortRef = useRef<AbortController | null>(null);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const abort = new AbortController();
    videoAbortRef.current = abort;
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const result = await apiClient.uploadVideoWithProgress(
        file,
        { title: lesson.title || file.name },
        undefined,
        (p) => setVideoProgress(p),
        abort
      );
      const data = (result as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as number | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ video_id: id, videoPreviewUrl: url });
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

  async function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const result = await apiClient.uploadAudio(file, {
        title: lesson.title || file.name
      });
      const data =
        (result as unknown as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as number | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ audio_id: id, audioPreviewUrl: url });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: lesson.title || file.name
      });
      const data = (result as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as number | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ cover_id: id, coverPreviewUrl: url });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Video */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonVideo')}
        </Label>
        {lesson.videoPreviewUrl ? (
          <div className="relative overflow-hidden rounded-md border bg-black/5">
            <video
              src={lesson.videoPreviewUrl}
              className="aspect-video w-full rounded-md object-cover"
              controls={false}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-8 w-8 text-white/80 drop-shadow" />
            </div>
            <button
              type="button"
              aria-label={t('courses.removeVideo')}
              onClick={() =>
                onUpdate({ video_id: undefined, videoPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingVideo ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <ProgressBar value={videoProgress} />
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => videoAbortRef.current?.abort()}
            >
              {t('courses.cancelUpload')}
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <Video className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadVideo')}
            </span>
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleVideoChange}
            />
          </label>
        )}
      </div>

      {/* Audio */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonAudio')}
        </Label>
        {lesson.audioPreviewUrl ? (
          <div className="relative rounded-md border px-3 py-2">
            <audio src={lesson.audioPreviewUrl} controls className="w-full" />
            <button
              type="button"
              aria-label={t('courses.removeAudio')}
              onClick={() =>
                onUpdate({ audio_id: undefined, audioPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingAudio ? (
          <div className="flex items-center justify-center rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadAudio')}
            </span>
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={handleAudioChange}
            />
          </label>
        )}
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonCover')}
        </Label>
        {lesson.coverPreviewUrl ? (
          <div className="relative overflow-hidden rounded-md border">
            <img
              src={lesson.coverPreviewUrl}
              alt={lesson.title}
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label={t('courses.removeCover')}
              onClick={() =>
                onUpdate({ cover_id: undefined, coverPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingImage ? (
          <div className="flex items-center justify-center rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadImage')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ─── Lesson row (sortable, expandable, with season dropdown in edit) ──────────

interface LessonRowProps {
  lesson: LessonDraft;
  index: number;
  seasons: SeasonDraft[];
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onRemove: () => void;
  onAssign: (seasonClientKey: string | undefined) => void;
}

function SortableLessonRow({
  lesson,
  index,
  seasons,
  onUpdate,
  onRemove,
  onAssign
}: LessonRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lesson.clientKey
  });

  const hasMedia = !!(lesson.video_id || lesson.cover_id);

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  useEffect(() => {
    if (!nodeRef.current) return;
    nodeRef.current.style.transform = CSS.Transform.toString(transform) ?? '';
    nodeRef.current.style.transition = transition ?? '';
  }, [transform, transition]);

  return (
    <div
      ref={combinedRef}
      className={cn(
        'rounded-md border border-border/50 bg-background/60',
        isDragging && 'opacity-50 shadow-lg ring-1 ring-primary/30'
      )}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label={t('courses.dragLesson')}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
          {index + 1}
        </span>

        <Input
          value={lesson.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={t('courses.enterLessonTitle')}
          className="h-7 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:border-input focus-visible:bg-background"
        />

        <div className="flex shrink-0 items-center gap-1">
          {hasMedia && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
              <Video className="h-2.5 w-2.5" />
            </Badge>
          )}
          {lesson.is_free && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] text-emerald-600"
            >
              {t('courses.free')}
            </Badge>
          )}
          {lesson.published && (
            <Badge className="h-5 px-1.5 text-[10px]">
              {t('courses.published')}
            </Badge>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={expanded ? t('common.close') : t('common.edit')}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => (lesson.id ? setConfirmDelete(true) : onRemove())}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
            aria-label={t('courses.removeLesson')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Delete confirm strip */}
      {confirmDelete && (
        <div className="flex items-center justify-between border-t bg-destructive/5 px-3 py-2 text-sm">
          <span className="text-destructive">Remove this lesson?</span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setConfirmDelete(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-6 px-2 text-xs"
              onClick={onRemove}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      )}

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-4 border-t px-3 py-3">
          <div className="space-y-1">
            <Label className="text-xs">{t('courses.lessonDescription')}</Label>
            <textarea
              value={lesson.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder={t('courses.optional')}
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Season assignment dropdown */}
          {seasons.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Season</Label>
              <Select
                value={lesson.seasonClientKey ?? '__unassigned__'}
                onValueChange={(v) =>
                  onAssign(v === '__unassigned__' ? undefined : v)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {seasons.map((s) => (
                    <SelectItem key={s.clientKey} value={s.clientKey}>
                      {s.title || `Season (untitled)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={lesson.is_free}
                onCheckedChange={(v) => onUpdate({ is_free: v })}
              />
              <span className="text-sm">{t('courses.freePreview')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={lesson.published}
                onCheckedChange={(v) => onUpdate({ published: v })}
              />
              <span className="text-sm">{t('courses.published')}</span>
            </label>
          </div>

          <LessonMedia lesson={lesson} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ─── Lessons list for a section (shared by Unassigned + each Season) ─────────

interface LessonListProps {
  sectionKey: string | undefined;
  lessons: LessonDraft[];
  seasons: SeasonDraft[];
  onAddLesson: () => void;
  onRemoveLesson: (key: string) => void;
  onUpdateLesson: (key: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (key: string, seasonClientKey: string | undefined) => void;
  onReorderLessons: (from: number, to: number) => void;
}

function LessonList({
  lessons,
  seasons,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons
}: LessonListProps) {
  const { t } = useTranslation();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = lessons.findIndex((l) => l.clientKey === active.id);
    const to = lessons.findIndex((l) => l.clientKey === over.id);
    if (from !== -1 && to !== -1) onReorderLessons(from, to);
  }

  return (
    <div className="space-y-2">
      {lessons.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-5 text-center text-xs text-muted-foreground">
          {t('courses.noLessonsYet')}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.clientKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {lessons.map((lesson, li) => (
                <SortableLessonRow
                  key={lesson.clientKey}
                  lesson={lesson}
                  index={li}
                  seasons={seasons}
                  onUpdate={(patch) => onUpdateLesson(lesson.clientKey, patch)}
                  onRemove={() => onRemoveLesson(lesson.clientKey)}
                  onAssign={(sk) => onAssignLesson(lesson.clientKey, sk)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={onAddLesson}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        {t('courses.addLesson')}
      </Button>
    </div>
  );
}

// ─── Season accordion (sortable + collapsible) ────────────────────────────────

interface SeasonAccordionProps {
  season: SeasonDraft;
  index: number;
  canRemove: boolean;
  lessons: LessonDraft[];
  allSeasons: SeasonDraft[];
  onUpdate: (
    patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>
  ) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onRemoveLesson: (key: string) => void;
  onUpdateLesson: (key: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (key: string, seasonClientKey: string | undefined) => void;
  onReorderLessons: (from: number, to: number) => void;
}

function SortableSeasonAccordion({
  season,
  index,
  canRemove,
  lessons,
  allSeasons,
  onUpdate,
  onRemove,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons
}: SeasonAccordionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: season.clientKey
  });

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  useEffect(() => {
    if (!nodeRef.current) return;
    nodeRef.current.style.transform = CSS.Transform.toString(transform) ?? '';
    nodeRef.current.style.transition = transition ?? '';
  }, [transform, transition]);

  return (
    <div
      ref={combinedRef}
      className={cn(
        'rounded-lg border border-border/60 bg-card/40',
        isDragging && 'opacity-50 shadow-xl ring-1 ring-primary/40'
      )}
    >
      {/* Season header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label={t('courses.dragSeason')}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">
            {t('courses.season')} {index + 1}
            {season.title ? ` — ${season.title}` : ''}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {lessons.length} {t('courses.lessons')}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            canRemove
              ? season.id
                ? setConfirmDelete(true)
                : onRemove()
              : undefined
          }
          disabled={!canRemove}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
          aria-label={t('courses.removeSeason')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Delete confirm — lessons move to Unassigned automatically */}
      {confirmDelete && (
        <div className="flex items-center gap-3 border-t bg-destructive/5 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span className="flex-1 text-sm text-destructive">
            {t('courses.confirmDeleteSeason')} Lessons will become unassigned.
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs"
            onClick={() => setConfirmDelete(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-7 px-3 text-xs"
            onClick={onRemove}
          >
            {t('common.delete')}
          </Button>
        </div>
      )}

      {open && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">
          {/* Season title + description */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('courses.seasonTitle')}</Label>
              <Input
                value={season.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder={t('courses.enterSeasonTitle')}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {t('courses.seasonDescription')}
              </Label>
              <Input
                value={season.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder={t('courses.optional')}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <LessonList
            sectionKey={season.clientKey}
            lessons={lessons}
            seasons={allSeasons}
            onAddLesson={onAddLesson}
            onRemoveLesson={onRemoveLesson}
            onUpdateLesson={onUpdateLesson}
            onAssignLesson={onAssignLesson}
            onReorderLessons={onReorderLessons}
          />
        </div>
      )}
    </div>
  );
}

// ─── SeasonsSection (exported) ────────────────────────────────────────────────

interface SeasonsSectionProps {
  seasons: SeasonDraft[];
  lessons: LessonDraft[];
  onAddSeason: () => void;
  onRemoveSeason: (key: string) => void;
  onUpdateSeason: (
    key: string,
    patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>
  ) => void;
  onReorderSeasons: (from: number, to: number) => void;
  onAddLesson: (seasonClientKey?: string) => void;
  onRemoveLesson: (lessonKey: string) => void;
  onUpdateLesson: (lessonKey: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (
    lessonKey: string,
    seasonClientKey: string | undefined
  ) => void;
  onReorderLessons: (
    sectionKey: string | undefined,
    from: number,
    to: number
  ) => void;
}

export function SeasonsSection({
  seasons,
  lessons,
  onAddSeason,
  onRemoveSeason,
  onUpdateSeason,
  onReorderSeasons,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons
}: SeasonsSectionProps) {
  const { t } = useTranslation();
  const seasonSensors = useSensors(useSensor(PointerSensor));

  const unassigned = lessons.filter((l) => !l.seasonClientKey);

  function handleSeasonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = seasons.findIndex((s) => s.clientKey === active.id);
    const to = seasons.findIndex((s) => s.clientKey === over.id);
    if (from !== -1 && to !== -1) onReorderSeasons(from, to);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t('courses.seasonsAndLessons')}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('courses.seasonsHint')}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAddSeason}>
          <Plus className="mr-1.5 h-4 w-4" />
          {t('courses.addSeason')}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {t('courses.addSeasonFirst')}
        </p>

        {/* Season accordions */}
        {seasons.length > 0 && (
          <DndContext
            sensors={seasonSensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleSeasonDragEnd}
          >
            <SortableContext
              items={seasons.map((s) => s.clientKey)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {seasons.map((season, si) => {
                  const seasonLessons = lessons.filter(
                    (l) => l.seasonClientKey === season.clientKey
                  );
                  return (
                    <SortableSeasonAccordion
                      key={season.clientKey}
                      season={season}
                      index={si}
                      canRemove={seasons.length > 1}
                      lessons={seasonLessons}
                      allSeasons={seasons}
                      onUpdate={(patch) =>
                        onUpdateSeason(season.clientKey, patch)
                      }
                      onRemove={() => onRemoveSeason(season.clientKey)}
                      onAddLesson={() => onAddLesson(season.clientKey)}
                      onRemoveLesson={onRemoveLesson}
                      onUpdateLesson={onUpdateLesson}
                      onAssignLesson={onAssignLesson}
                      onReorderLessons={(from, to) =>
                        onReorderLessons(season.clientKey, from, to)
                      }
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
