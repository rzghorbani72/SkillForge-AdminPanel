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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Loader2,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { LessonDraft, SeasonDraft } from './useCourseForm';

// ─── Lesson media uploader ────────────────────────────────────────────────────

// Applies width imperatively to avoid style prop in JSX (linter rule)
function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return <div ref={ref} className="h-full bg-primary transition-all" />;
}

interface LessonMediaProps {
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
}

function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
      const data = (result as any)?.data ?? result;
      const id: number = data?.id ?? data?.data?.id;
      const url: string = data?.publicUrl ?? data?.data?.publicUrl ?? '';
      if (id) onUpdate({ video_id: id, videoPreviewUrl: url });
    } catch (err) {
      if ((err as Error).message !== 'Upload cancelled') {
        ErrorHandler.handleApiError(err);
      }
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      videoAbortRef.current = null;
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
      const data = (result as any)?.data ?? result;
      const id: number = data?.id ?? data?.data?.id;
      const url: string = data?.publicUrl ?? data?.data?.publicUrl ?? '';
      if (id) onUpdate({ cover_id: id, coverPreviewUrl: url });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
              onClick={() =>
                onUpdate({ video_id: undefined, videoPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              aria-label={t('courses.removeVideo')}
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
              onClick={() =>
                onUpdate({ cover_id: undefined, coverPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
              aria-label={t('courses.removeCover')}
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

// ─── Single lesson row (sortable + expandable) ────────────────────────────────

interface LessonRowProps {
  lesson: LessonDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onRemove: () => void;
}

function SortableLessonRow({
  lesson,
  index,
  canRemove,
  onUpdate,
  onRemove
}: LessonRowProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.clientKey });

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
      {/* ── Collapsed header ─────────────────────────────────────────────── */}
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

        <span className="w-6 shrink-0 text-xs text-muted-foreground">
          {index + 1}.
        </span>

        {/* Title — editable inline when collapsed */}
        <Input
          value={lesson.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={t('courses.enterLessonTitle')}
          className="h-7 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:border-input focus-visible:bg-background"
        />

        <div className="flex shrink-0 items-center gap-1.5">
          {hasMedia && (
            <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
              <Video className="h-2.5 w-2.5" />
            </Badge>
          )}

          {/* Status badges */}
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

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={expanded ? t('common.close') : t('common.edit')}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-30"
            aria-label={t('courses.removeLesson')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Expanded editor ───────────────────────────────────────────────── */}
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

// ─── Season card (sortable + collapsible) ─────────────────────────────────────

interface SeasonCardProps {
  season: SeasonDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (
    patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>
  ) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onRemoveLesson: (key: string) => void;
  onUpdateLesson: (key: string, patch: Partial<LessonDraft>) => void;
  onReorderLessons: (from: number, to: number) => void;
}

function SortableSeasonCard({
  season,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onReorderLessons
}: SeasonCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: season.clientKey });

  const lessonSensors = useSensors(useSensor(PointerSensor));

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

  function handleLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = season.lessons.findIndex((l) => l.clientKey === active.id);
    const to = season.lessons.findIndex((l) => l.clientKey === over.id);
    if (from !== -1 && to !== -1) onReorderLessons(from, to);
  }

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
            {season.lessons.length} {t('courses.lessons')}
          </span>
        </button>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-30"
          aria-label={t('courses.removeSeason')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">
          {/* Season fields */}
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

          {/* Lessons */}
          <div className="space-y-2">
            <DndContext
              sensors={lessonSensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleLessonDragEnd}
            >
              <SortableContext
                items={season.lessons.map((l) => l.clientKey)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {season.lessons.map((lesson, li) => (
                    <SortableLessonRow
                      key={lesson.clientKey}
                      lesson={lesson}
                      index={li}
                      canRemove={season.lessons.length > 1}
                      onUpdate={(patch) =>
                        onUpdateLesson(lesson.clientKey, patch)
                      }
                      onRemove={() => onRemoveLesson(lesson.clientKey)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

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
        </div>
      )}
    </div>
  );
}

// ─── SeasonsSection (exported) ────────────────────────────────────────────────

interface SeasonsSectionProps {
  seasons: SeasonDraft[];
  onAddSeason: () => void;
  onRemoveSeason: (key: string) => void;
  onUpdateSeason: (
    key: string,
    patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>
  ) => void;
  onReorderSeasons: (from: number, to: number) => void;
  onAddLesson: (seasonKey: string) => void;
  onRemoveLesson: (seasonKey: string, lessonKey: string) => void;
  onUpdateLesson: (
    seasonKey: string,
    lessonKey: string,
    patch: Partial<LessonDraft>
  ) => void;
  onReorderLessons: (seasonKey: string, from: number, to: number) => void;
}

export function SeasonsSection({
  seasons,
  onAddSeason,
  onRemoveSeason,
  onUpdateSeason,
  onReorderSeasons,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onReorderLessons
}: SeasonsSectionProps) {
  const { t } = useTranslation();
  const sensors = useSensors(useSensor(PointerSensor));

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

      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleSeasonDragEnd}
        >
          <SortableContext
            items={seasons.map((s) => s.clientKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {seasons.map((season, si) => (
                <SortableSeasonCard
                  key={season.clientKey}
                  season={season}
                  index={si}
                  canRemove={seasons.length > 1}
                  onUpdate={(patch) => onUpdateSeason(season.clientKey, patch)}
                  onRemove={() => onRemoveSeason(season.clientKey)}
                  onAddLesson={() => onAddLesson(season.clientKey)}
                  onRemoveLesson={(lk) => onRemoveLesson(season.clientKey, lk)}
                  onUpdateLesson={(lk, patch) =>
                    onUpdateLesson(season.clientKey, lk, patch)
                  }
                  onReorderLessons={(f, t2) =>
                    onReorderLessons(season.clientKey, f, t2)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
