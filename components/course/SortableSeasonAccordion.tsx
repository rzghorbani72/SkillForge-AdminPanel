'use client';

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { MESSAGES } from '@/constants/messages';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { LessonList } from './LessonList';
import { useState } from 'react';

// Completeness helper — mirrors the one in SortableLessonRow
function isLessonComplete(lesson: LessonDraft): boolean {
  if (!lesson.title.trim()) return false;
  if (lesson.lesson_type === 'LIVE') return true;
  if (lesson.lesson_type === 'VIDEO') return !!lesson.video_id;
  if (lesson.lesson_type === 'AUDIO') return !!lesson.audio_id;
  return !!lesson.document_id;
}

interface SeasonAccordionProps {
  season: SeasonDraft;
  index: number;
  canRemove: boolean;
  lessons: LessonDraft[];
  allSeasons: SeasonDraft[];
  /** When provided, this component becomes controlled. Otherwise it manages its own open state. */
  open?: boolean;
  onToggle?: () => void;
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

export function SortableSeasonAccordion({
  season,
  index,
  canRemove,
  lessons,
  allSeasons,
  open: controlledOpen,
  onToggle,
  onUpdate,
  onRemove,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons
}: SeasonAccordionProps) {
  const { t } = useTranslation();
  const [localOpen, setLocalOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Support both controlled and uncontrolled
  const isOpen = controlledOpen !== undefined ? controlledOpen : localOpen;
  function toggle() {
    if (onToggle) {
      onToggle();
    } else {
      setLocalOpen((v) => !v);
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: season.clientKey });

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

  const totalLessons = lessons.length;
  const readyCount = lessons.filter(isLessonComplete).length;

  return (
    <div
      ref={combinedRef}
      className={cn(
        'rounded-lg border border-border/60 bg-card/40',
        isDragging && 'opacity-50 shadow-xl ring-1 ring-primary/40'
      )}
    >
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
          onClick={toggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold">
            {t('courses.season')} {index + 1}
            {season.title ? ` — ${season.title}` : ''}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {totalLessons > 0
              ? t('courses.lessonsReady', {
                  n: readyCount,
                  total: totalLessons
                })
              : `0 ${t('courses.lessons')}`}
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

      {confirmDelete && (
        <div className="flex items-center gap-3 border-t bg-destructive/5 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span className="flex-1 text-sm text-destructive">
            {t('courses.confirmDeleteSeason')}{' '}
            {MESSAGES.course.lessonsWillBeUnassigned}
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

      {isOpen && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">
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
