'use client';

import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GripVertical,
  Mic,
  Radio,
  Trash2,
  Video
} from 'lucide-react';
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
import type { LessonDraft, LessonType, SeasonDraft } from './useCourseForm';
import { clearIncompatibleMedia } from './course-drafts';
import { LessonMedia } from './LessonMedia';
import { InlineConfirm } from './InlineConfirm';

// ─── Type chip config ──────────────────────────────────────────────────────────

const LESSON_TYPES: {
  type: LessonType;
  labelKey: string;
  Icon: React.ElementType;
}[] = [
  { type: 'VIDEO', labelKey: 'courses.lessonTypeVideo', Icon: Video },
  { type: 'AUDIO', labelKey: 'courses.lessonTypeAudio', Icon: Mic },
  { type: 'TEXT', labelKey: 'courses.lessonTypeText', Icon: FileText },
  { type: 'QUIZ', labelKey: 'courses.lessonTypeQuiz', Icon: ClipboardList },
  {
    type: 'ASSIGNMENT',
    labelKey: 'courses.lessonTypeAssignment',
    Icon: ClipboardCheck
  },
  { type: 'LIVE', labelKey: 'courses.lessonTypeLive', Icon: Radio }
];

const TYPE_ICON_MAP: Record<LessonType, React.ElementType> = {
  VIDEO: Video,
  AUDIO: Mic,
  TEXT: FileText,
  QUIZ: ClipboardList,
  ASSIGNMENT: ClipboardCheck,
  LIVE: Radio
};

// ─── Completeness ──────────────────────────────────────────────────────────────

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

  const TypeIcon = TYPE_ICON_MAP[lesson.lesson_type] ?? Video;
  const complete = isLessonComplete(lesson);

  // A blank lesson is just an empty slot — there's nothing in it to delete.
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
        'rounded-md border border-border/50 bg-background/60',
        isDragging && 'opacity-50 shadow-lg ring-1 ring-primary/30'
      )}
    >
      {/* ── Compact row ─────────────────────────────────────────────────── */}
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

        {/* Completeness dot */}
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
          className="h-7 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:border-input focus-visible:bg-background"
        />

        <div className="flex shrink-0 items-center gap-1">
          <Badge
            variant="secondary"
            className="h-5 gap-1 px-1.5 text-[10px]"
            title={t(
              `courses.lessonType${lesson.lesson_type.charAt(0) + lesson.lesson_type.slice(1).toLowerCase()}`
            )}
          >
            <TypeIcon className="h-2.5 w-2.5" />
          </Badge>
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
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            )}
          </button>
          {!isBlank && (
            <button
              type="button"
              onClick={handleTrashClick}
              className="rounded p-0.5 text-muted-foreground hover:text-destructive"
              aria-label={
                canRemove ? t('courses.removeLesson') : t('courses.clearLesson')
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
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

      {/* ── Expanded panel ───────────────────────────────────────────────── */}
      {expanded && (
        <div className="space-y-4 border-t px-3 py-3">
          {/* Lesson type chips */}
          <div className="space-y-1.5">
            <Label className="text-xs">{t('courses.lessonType')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {LESSON_TYPES.map(({ type, labelKey, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      lesson_type: type,
                      ...clearIncompatibleMedia(type)
                    })
                  }
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                    lesson.lesson_type === type
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t('courses.lessonDescription')}</Label>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t('courses.lessonDuration')}</Label>
              <Input
                value={lesson.duration}
                onChange={(e) => onUpdate({ duration: e.target.value })}
                placeholder="00:00"
                inputMode="numeric"
                className="h-8 text-sm"
              />
            </div>

            {seasons.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">{t('courses.season')}</Label>
                {/* No "unassigned" option: a lesson outside every season is
                    saved but never rendered, so it silently disappears. */}
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

          {/* Live lesson notice */}
          {lesson.lesson_type === 'LIVE' ? (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {t('courses.liveSaveFirst')}
            </p>
          ) : (
            <LessonMedia lesson={lesson} onUpdate={onUpdate} />
          )}
        </div>
      )}
    </div>
  );
}
