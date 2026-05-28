'use client';

import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export function SortableSeasonAccordion({
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

      {open && (
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
