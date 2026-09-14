'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { SortableLessonRow } from './SortableLessonRow';
import { QuickAddRow } from './QuickAddRow';

interface LessonListProps {
  lessons: LessonDraft[];
  seasons: SeasonDraft[];
  onAddLesson: (title: string) => void;
  onRemoveLesson: (key: string) => void;
  onClearLesson: (key: string) => void;
  onUpdateLesson: (key: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (key: string, seasonClientKey: string) => void;
  onReorderLessons: (from: number, to: number) => void;
}

export function LessonList({
  lessons,
  seasons,
  onAddLesson,
  onRemoveLesson,
  onClearLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons,
}: LessonListProps) {
  const { t } = useTranslation();
  const sensors = useSensors(useSensor(PointerSensor));

  // An untitled lesson is dropped on save, so stacking more on top of it just
  // multiplies the rows that will silently disappear.
  const hasUntitledLesson = lessons.some((l) => !l.title.trim());

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = lessons.findIndex((l) => l.clientKey === active.id);
    const to = lessons.findIndex((l) => l.clientKey === over.id);
    if (from !== -1 && to !== -1) onReorderLessons(from, to);
  }

  return (
    <div className="space-y-2">
      {lessons.length > 0 && (
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
              {lessons.map((lesson, index) => (
                <SortableLessonRow
                  key={lesson.clientKey}
                  lesson={lesson}
                  index={index}
                  seasons={seasons}
                  canRemove={lessons.length > 1}
                  onUpdate={(patch) => onUpdateLesson(lesson.clientKey, patch)}
                  onRemove={() => onRemoveLesson(lesson.clientKey)}
                  onClear={() => onClearLesson(lesson.clientKey)}
                  onAssign={(key) => onAssignLesson(lesson.clientKey, key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <QuickAddRow
        placeholder={t('courses.addLessonHint')}
        onAdd={onAddLesson}
        blockedReason={hasUntitledLesson ? t('courses.addLessonBlocked') : undefined}
      />
    </div>
  );
}
