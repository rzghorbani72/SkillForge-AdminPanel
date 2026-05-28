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
        <p className="rounded-md border border-dashed px-4 py-5 text-center text-xs text-muted-foreground">
          {t('courses.noLessonsYet')}
        </p>
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
                  onUpdate={(patch) => onUpdateLesson(lesson.clientKey, patch)}
                  onRemove={() => onRemoveLesson(lesson.clientKey)}
                  onAssign={(sk) => onAssignLesson(lesson.clientKey, sk)}
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
