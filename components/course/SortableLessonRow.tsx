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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { durationToSeconds } from './course-drafts';
import { InlineConfirm } from './InlineConfirm';
import { LESSON_TYPE_BY_KEY } from './lesson-type-config';
import { LessonEditorPanel } from './lesson-editor-panel';

function isLessonComplete(lesson: LessonDraft): boolean | null {
  if (!lesson.title.trim()) return null;
  if (lesson.lesson_type === 'LIVE') return true;
  if (lesson.lesson_type === 'VIDEO') return !!lesson.video_id;
  if (lesson.lesson_type === 'AUDIO') return !!lesson.audio_id;
  return !!lesson.document_id;
}

interface LessonRowProps {
  lesson: LessonDraft;
  index: number;
  seasons: SeasonDraft[];
  /** false when this is the only lesson left in the season. */
  canRemove: boolean;
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onRemove: () => void;
  /** Called instead of onRemove when canRemove is false: wipes it back to blank. */
  onClear: () => void;
  onAssign: (seasonClientKey: string) => void;
}

export function SortableLessonRow({
  lesson,
  index,
  seasons,
  canRemove,
  onUpdate,
  onRemove,
  onClear,
  onAssign
}: LessonRowProps) {
  const { t, language } = useTranslation();
  const isFa = language === 'fa';
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.clientKey });

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

  const typeOption =
    LESSON_TYPE_BY_KEY[lesson.lesson_type] ?? LESSON_TYPE_BY_KEY.VIDEO;
  const TypeIcon = typeOption.Icon;
  const typeLabel = t(typeOption.labelKey);
  const complete = isLessonComplete(lesson);
  const durationSeconds = durationToSeconds(lesson.duration);
  const durationLabel = isFa
    ? toPersianDigits(lesson.duration)
    : lesson.duration;
  const isBlank = !lesson.title.trim();

  function handleTrashClick() {
    if (!canRemove) {
      if (lesson.id) setConfirmDelete(true);
      else onClear();
      return;
    }
    if (lesson.id) {
      setConfirmDelete(true);
    } else {
      onRemove();
    }
  }

  return (
    <div
      ref={combinedRef}
      className={cn(
        // The start bar carries the lesson type's color, so where one lesson's
        // block begins and ends stays obvious even with several open at once.
        'rounded-md border border-s-[3px] border-border/50 bg-background/60',
        typeOption.accentClass,
        expanded && 'border-border bg-muted/30 shadow-sm ring-1 ring-border',
        isDragging && 'opacity-50 shadow-lg ring-1 ring-primary/30'
      )}
    >
      {/* Compact row: badges/actions on the left, title on the right */}
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5',
          expanded && 'bg-background/80'
        )}
        dir="ltr"
      >
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label={expanded ? t('common.close') : t('common.edit')}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              )}
            </button>
            {!isBlank && (
              <button
                type="button"
                onClick={handleTrashClick}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                aria-label={
                  canRemove
                    ? t('courses.removeLesson')
                    : t('courses.clearLesson')
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 border-s border-border/60 ps-2">
            <span
              className={cn(
                'pointer-events-none inline-flex h-5 cursor-default select-none items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium',
                typeOption.badgeClass
              )}
              aria-label={typeLabel}
            >
              <TypeIcon className="h-2.5 w-2.5 shrink-0" aria-hidden />
              {typeLabel}
            </span>
            {durationSeconds > 0 && (
              <span
                className="inline-flex h-5 items-center gap-1 rounded-md border border-border/60 px-1.5 text-[10px] tabular-nums text-muted-foreground"
                title={t('courses.lessonDuration')}
              >
                <Clock className="h-2.5 w-2.5 shrink-0" aria-hidden />
                {durationLabel}
              </span>
            )}
            {lesson.is_free && (
              <Badge
                variant="outline"
                className="pointer-events-none h-5 cursor-default px-1.5 text-[10px] text-emerald-600 hover:bg-transparent"
              >
                {t('courses.free')}
              </Badge>
            )}
            {lesson.published && (
              <Badge className="pointer-events-none h-5 cursor-default px-1.5 text-[10px] hover:bg-primary">
                {t('courses.published')}
              </Badge>
            )}
          </div>
        </div>

        <div
          className="flex min-w-0 flex-1 items-center gap-2"
          dir={isFa ? 'rtl' : 'ltr'}
        >
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label={t('courses.dragLesson')}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
            {index + 1}
          </span>

          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              complete === null
                ? 'bg-muted-foreground/40'
                : complete
                  ? 'bg-emerald-500'
                  : 'bg-amber-400'
            )}
            title={
              complete === null
                ? ''
                : complete
                  ? t('courses.lessonComplete')
                  : t('courses.lessonIncomplete')
            }
          />

          <Input
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={t('courses.enterLessonTitle')}
            className="h-7 min-w-0 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:border-input focus-visible:bg-background"
          />
        </div>
      </div>

      {confirmDelete && (
        <InlineConfirm
          message={
            canRemove
              ? t('courses.confirmRemoveLesson')
              : t('courses.confirmClearLesson')
          }
          onCancel={() => setConfirmDelete(false)}
          onConfirm={canRemove ? onRemove : onClear}
        />
      )}

      {expanded && (
        <LessonEditorPanel
          lesson={lesson}
          seasons={seasons}
          onUpdate={onUpdate}
          onAssign={onAssign}
        />
      )}
    </div>
  );
}
