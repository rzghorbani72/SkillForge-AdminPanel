'use client';

import {
  ChevronDown,
  ChevronRight,
  Clock,
  GripVertical,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { toPersianDigits } from '@/lib/phone-utils';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { secondsToDuration, sumDurationSeconds } from './course-drafts';
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
  onUpdate: (patch: Partial<Pick<SeasonDraft, 'title'>>) => void;
  onRemove: () => void;
  /** Called instead of onRemove when this is the last season: wipes it back to blank. */
  onClear: () => void;
  onAddLesson: (title: string) => void;
  onRemoveLesson: (key: string) => void;
  onClearLesson: (key: string) => void;
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
  onClear,
  onAddLesson,
  onRemoveLesson,
  onClearLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons
}: SeasonAccordionProps) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
  // Season length is never typed: it is the sum of what its lessons actually play.
  const seasonSeconds = sumDurationSeconds(lessons);
  const seasonLength = secondsToDuration(seasonSeconds);
  // The placeholder doubles as the season's name until one is typed, so the
  // heading never shows a number and an empty field saying the same thing.
  const fallbackTitle = t('courses.seasonNumber', {
    n: formatNumber(index + 1)
  });

  // A blank season is just an empty slot — there's nothing in it to delete.
  const isBlank = !season.title.trim() && total === 0;

  function handleTrashClick() {
    if (!canRemove) {
      // Can't drop below one season, so this wipes it instead of removing it.
      if (season.id || total > 0) setConfirmDelete(true);
      else onClear();
      return;
    }
    if (season.id) {
      setConfirmDelete(true);
    } else {
      onRemove();
    }
  }

  return (
    <div
      ref={combinedRef}
      className={cn(
        'rounded-lg border border-border/60 bg-card/40',
        isDragging && 'opacity-50 shadow-xl ring-1 ring-primary/40'
      )}
    >
      <div className="group flex items-center gap-3 px-3 py-2.5" dir="ltr">
        <div className="flex shrink-0 items-center gap-2">
          {seasonSeconds > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md border border-border/60 px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground"
              title={t('courses.seasonLength')}
            >
              <Clock className="h-3 w-3" aria-hidden />
              {language === 'fa' ? toPersianDigits(seasonLength) : seasonLength}
            </span>
          )}
          {total > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {ready === total
                ? t('courses.lessonCount', { n: formatNumber(total) })
                : t('courses.lessonsReady', {
                    n: formatNumber(ready),
                    total: formatNumber(total)
                  })}
            </span>
          )}
          {!isBlank && (
            <button
              type="button"
              onClick={handleTrashClick}
              className="rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={
                canRemove ? t('courses.removeSeason') : t('courses.clearSeason')
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div
          className="flex min-w-0 flex-1 items-center gap-1.5"
          dir={language === 'fa' ? 'rtl' : 'ltr'}
        >
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-foreground"
            aria-label={t('courses.dragSeason')}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={
              open ? t('courses.collapseAll') : t('courses.expandAll')
            }
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
            className="h-7 min-w-0 flex-1 border-transparent bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:border-input focus-visible:bg-background"
          />
        </div>
      </div>

      {confirmDelete && (
        <InlineConfirm
          message={
            canRemove
              ? `${t('courses.confirmDeleteSeason')} ${t('courses.lessonsWillBeUnassigned')}`
              : t('courses.confirmClearSeason')
          }
          onCancel={() => setConfirmDelete(false)}
          onConfirm={canRemove ? onRemove : onClear}
        />
      )}

      {open && (
        <div className="space-y-2 border-t px-3 pb-3 pt-2.5">
          <LessonList
            lessons={lessons}
            seasons={allSeasons}
            onAddLesson={onAddLesson}
            onRemoveLesson={onRemoveLesson}
            onClearLesson={onClearLesson}
            onUpdateLesson={onUpdateLesson}
            onAssignLesson={onAssignLesson}
            onReorderLessons={onReorderLessons}
          />
        </div>
      )}
    </div>
  );
}
