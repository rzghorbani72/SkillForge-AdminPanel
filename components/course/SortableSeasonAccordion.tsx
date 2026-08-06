'use client';

import { ChevronDown, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { MESSAGES } from '@/constants/messages';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { LessonList } from './LessonList';
import { InlineConfirm } from './InlineConfirm';

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
  open: boolean;
  onToggle: () => void;
  onUpdate: (
    patch: Partial<Pick<SeasonDraft, 'title' | 'description'>>
  ) => void;
  onRemove: () => void;
  onAddLesson: (title: string) => void;
  onRemoveLesson: (key: string) => void;
  onUpdateLesson: (key: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (key: string, seasonClientKey: string) => void;
  onReorderLessons: (from: number, to: number) => void;
}

export function SortableSeasonAccordion({
  season,
  index,
  canRemove,
  lessons,
  allSeasons,
  open,
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
  const formatNumber = useNumberFormat();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDescription, setShowDescription] = useState(
    () => season.description.length > 0
  );

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

  const total = lessons.length;
  const ready = lessons.filter(isLessonComplete).length;
  // The placeholder doubles as the season's name until one is typed, so the
  // heading never shows a number and an empty field saying the same thing.
  const fallbackTitle = t('courses.seasonNumber', {
    n: formatNumber(index + 1)
  });

  return (
    <div
      ref={combinedRef}
      className={cn(
        'rounded-lg border border-border/60 bg-card/40',
        isDragging && 'opacity-50 shadow-xl ring-1 ring-primary/40'
      )}
    >
      <div className="group flex items-center gap-1.5 px-3 py-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-foreground"
          aria-label={t('courses.dragSeason')}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label={open ? t('courses.collapseAll') : t('courses.expandAll')}
        >
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          )}
        </button>

        <Input
          value={season.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
          placeholder={fallbackTitle}
          aria-label={t('courses.seasonTitle')}
          className="h-7 flex-1 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:border-input focus-visible:bg-background"
        />

        {total > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {ready === total
              ? t('courses.lessonCount', { n: formatNumber(total) })
              : t('courses.lessonsReady', {
                  n: formatNumber(ready),
                  total: formatNumber(total)
                })}
          </span>
        )}
        <button
          type="button"
          onClick={() =>
            season.id ? setConfirmDelete(true) : canRemove ? onRemove() : null
          }
          disabled={!canRemove}
          className="shrink-0 rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 disabled:opacity-0 group-hover:opacity-100"
          aria-label={t('courses.removeSeason')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {confirmDelete && (
        <InlineConfirm
          message={`${t('courses.confirmDeleteSeason')} ${MESSAGES.course.lessonsWillBeUnassigned}`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={onRemove}
        />
      )}

      {open && (
        <div className="space-y-2 border-t px-3 pb-3 pt-2.5">
          <LessonList
            lessons={lessons}
            seasons={allSeasons}
            onAddLesson={onAddLesson}
            onRemoveLesson={onRemoveLesson}
            onUpdateLesson={onUpdateLesson}
            onAssignLesson={onAssignLesson}
            onReorderLessons={onReorderLessons}
          />

          {showDescription ? (
            <Input
              value={season.description}
              autoFocus={!season.description}
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              placeholder={t('courses.seasonDescription')}
              className="h-8 text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              + {t('courses.seasonDescription')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
