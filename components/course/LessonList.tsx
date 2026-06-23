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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { SortableLessonRow } from './SortableLessonRow';

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

export function LessonList({
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

  // Map clientKey → input ref so we can focus after Enter-add
  const inputRefs = useRef<
    Map<string, React.RefObject<HTMLInputElement | null>>
  >(new Map());

  const getOrCreateRef = useCallback((key: string) => {
    if (!inputRefs.current.has(key)) {
      inputRefs.current.set(key, { current: null });
    }
    return inputRefs.current.get(key)!;
  }, []);

  function handleTitleEnter(currentKey: string) {
    onAddLesson();
    // The new lesson isn't in the list yet — wait one tick for state update
    setTimeout(() => {
      const keys = Array.from(inputRefs.current.keys());
      const idx = keys.indexOf(currentKey);
      const nextKey = keys[idx + 1];
      if (nextKey) {
        inputRefs.current.get(nextKey)?.current?.focus();
      }
    }, 50);
  }

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
        <button
          type="button"
          onClick={onAddLesson}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('courses.addFirstLesson')}
        </button>
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
                  titleInputRef={getOrCreateRef(lesson.clientKey)}
                  onUpdate={(patch) => onUpdateLesson(lesson.clientKey, patch)}
                  onRemove={() => onRemoveLesson(lesson.clientKey)}
                  onAssign={(sk) => onAssignLesson(lesson.clientKey, sk)}
                  onTitleEnter={() => handleTitleEnter(lesson.clientKey)}
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
