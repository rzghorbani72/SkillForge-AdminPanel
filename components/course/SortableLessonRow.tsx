'use client';

import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Video
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { MESSAGES } from '@/constants/messages';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { LessonMedia } from './LessonMedia';

interface LessonRowProps {
  lesson: LessonDraft;
  index: number;
  seasons: SeasonDraft[];
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onRemove: () => void;
  onAssign: (seasonClientKey: string | undefined) => void;
}

export function SortableLessonRow({
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

      {confirmDelete && (
        <div className="flex items-center justify-between border-t bg-destructive/5 px-3 py-2 text-sm">
          <span className="text-destructive">
            {MESSAGES.course.confirmRemoveLesson}
          </span>
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
          {seasons.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">{t('courses.season')}</Label>
              <Select
                value={lesson.seasonClientKey ?? '__unassigned__'}
                onValueChange={(v) =>
                  onAssign(v === '__unassigned__' ? undefined : v)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder={MESSAGES.course.unassigned} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">
                    {MESSAGES.course.unassigned}
                  </SelectItem>
                  {seasons.map((s) => (
                    <SelectItem key={s.clientKey} value={s.clientKey}>
                      {s.title || MESSAGES.course.seasonUntitled}
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
