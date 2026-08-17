'use client';

import { ChevronDown, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterCounter } from '@/components/ui/character-counter';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { LESSON_DESCRIPTION_MAX } from '@/components/lesson/schema';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import {
  DEFAULT_DURATION,
  clearIncompatibleMedia,
  isTimedLessonType
} from './course-drafts';
import { LessonMedia, LESSON_MEDIA_SLOT_CLASS } from './LessonMedia';
import { InlineConfirm } from './InlineConfirm';
import { LESSON_TYPE_BY_KEY, LESSON_TYPE_OPTIONS } from './lesson-type-config';
import { LessonDurationField } from './lesson-duration-field';

function isLessonComplete(lesson: LessonDraft): boolean | null {
  if (!lesson.title.trim()) return null;
  if (lesson.lesson_type === 'LIVE') return true;
  if (lesson.lesson_type === 'VIDEO') return !!lesson.video_id;
  if (lesson.lesson_type === 'AUDIO') return !!lesson.audio_id;
  return !!lesson.document_id;
}

/**
 * Switching type drops the media the old type owned, so a length measured from
 * that media would keep claiming a file the lesson no longer has.
 */
function patchForType(
  lesson: LessonDraft,
  type: LessonDraft['lesson_type']
): Partial<LessonDraft> {
  const losesItsLength =
    isTimedLessonType(lesson.lesson_type) && type !== lesson.lesson_type;
  return {
    lesson_type: type,
    ...clearIncompatibleMedia(type),
    ...(losesItsLength ? { duration: DEFAULT_DURATION } : {})
  };
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
        <div className="space-y-3 border-t px-3 py-3">
          {/* 1. Content: type + the file it plays */}
          <section className="space-y-3 rounded-md border bg-background p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('courses.lessonSectionContent')}
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('courses.lessonType')}</Label>
              <div
                className="flex flex-wrap gap-1.5"
                role="radiogroup"
                aria-label={t('courses.lessonType')}
              >
                {LESSON_TYPE_OPTIONS.map(
                  ({ type, labelKey, Icon, chipActiveClass }) => {
                    const selected = lesson.lesson_type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onUpdate(patchForType(lesson, type))}
                        className={cn(
                          'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                          selected
                            ? chipActiveClass
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {t(labelKey)}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 2. Upload / live content — directly under type */}
            {lesson.lesson_type === 'LIVE' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t(LESSON_TYPE_BY_KEY.LIVE.labelKey)}
                </Label>
                <p
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-lg border border-dashed border-rose-200 bg-rose-50/60 px-4 text-center text-xs leading-snug text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
                    LESSON_MEDIA_SLOT_CLASS
                  )}
                >
                  {t('courses.liveSaveFirst')}
                </p>
              </div>
            ) : (
              <LessonMedia lesson={lesson} onUpdate={onUpdate} />
            )}
          </section>

          {/* 2. Details: description, length, season */}
          <section className="space-y-3 rounded-md border bg-background p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('courses.lessonSectionDetails')}
            </p>
            <div className="max-w-2xl space-y-1">
              <Label className="text-xs">
                {t('courses.lessonDescription')}
              </Label>
              <textarea
                value={lesson.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder={t('courses.optional')}
                rows={3}
                maxLength={LESSON_DESCRIPTION_MAX}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <CharacterCounter
                length={lesson.description?.length ?? 0}
                maxLength={LESSON_DESCRIPTION_MAX}
                className="text-end text-xs"
              />
            </div>

            {/* Length + season — compact controls, not full-bleed */}
            <div className="flex flex-wrap items-start gap-4">
              {isTimedLessonType(lesson.lesson_type) && (
                <LessonDurationField
                  lesson={lesson}
                  onChange={(duration) => onUpdate({ duration })}
                />
              )}

              {seasons.length > 0 && (
                <div className="w-full max-w-[14rem] space-y-1">
                  <Label className="text-xs">{t('courses.season')}</Label>
                  <Select
                    value={lesson.seasonClientKey}
                    onValueChange={(value) => onAssign(value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s, i) => (
                        <SelectItem key={s.clientKey} value={s.clientKey}>
                          {s.title || t('courses.seasonNumber', { n: i + 1 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          {/* 3. Visibility toggles */}
          <section className="flex flex-wrap gap-4 rounded-md border bg-background p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={lesson.published}
                onCheckedChange={(v) => onUpdate({ published: v })}
              />
              <span className="text-sm">{t('courses.published')}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={lesson.is_free}
                onCheckedChange={(v) => onUpdate({ is_free: v })}
              />
              <span className="text-sm">{t('courses.freePreview')}</span>
            </label>
          </section>
        </div>
      )}
    </div>
  );
}
