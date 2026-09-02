'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';
import { SetupCard } from '@/components/course/live/setup-card';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseTopic } from '@/types/learning-operations';
import SortableTopicRow from './sortable-topic-row';

/** Rows need a stable key while unsaved, so a new one gets a local key. */
type Draft = { key: string; id?: string; title: string };

interface TopicListEditorProps {
  courseId: string;
  initial: CourseTopic[];
  onSaved?: (topics: CourseTopic[]) => void;
}

let localKeySeq = 0;
const newDraft = (): Draft => ({ key: `new-${localKeySeq++}`, title: '' });

/** What the server holds, so an edit can be told apart from a reorder-free visit. */
const signature = (rows: readonly { title: string }[]) =>
  rows.map((row) => row.title.trim()).join('\u0000');

/**
 * The syllabus a live course promises. Saved as one ordered list rather than
 * row by row, so reordering and renaming are a single call the backend can
 * validate against the meetings already named after a topic.
 */
export default function TopicListEditor({
  courseId,
  initial,
  onSaved
}: TopicListEditorProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((topic) => ({
      key: topic.id,
      id: topic.id,
      title: topic.title
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(() => signature(initial));
  const sensors = useSensors(useSensor(PointerSensor));
  const dirty = useMemo(
    () => signature(drafts.filter((row) => row.title.trim())) !== saved,
    [drafts, saved]
  );

  const update = (key: string, title: string) =>
    setDrafts((rows) =>
      rows.map((row) => (row.key === key ? { ...row, title } : row))
    );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDrafts((rows) => {
      const from = rows.findIndex((row) => row.key === active.id);
      const to = rows.findIndex((row) => row.key === over.id);
      if (from === -1 || to === -1) return rows;
      const next = [...rows];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const save = async () => {
    // Order is the list order: the backend stores it, so what the teacher sees
    // here is the order a student is promised.
    const topics = drafts
      .map((row) => ({ id: row.id, title: row.title.trim() }))
      .filter((row) => row.title);
    if (!topics.length) {
      toast.error(t('courses.live.topicsRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const saved = await apiClient.replaceCourseTopics(courseId, topics);
      setDrafts(
        saved.map((topic) => ({
          key: topic.id,
          id: topic.id,
          title: topic.title
        }))
      );
      setSaved(signature(saved));
      onSaved?.(saved);
      toast.success(t('courses.live.topicsSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SetupCard
      step={1}
      title={t('courses.live.topics')}
      description={t('courses.live.topicsHint')}
      done={drafts.some((row) => row.title.trim()) && !dirty}
      dirty={dirty}
    >
      <div className="space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={drafts.map((row) => row.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {drafts.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                  {t('courses.live.topicsEmpty')}
                </p>
              ) : null}
              {drafts.map((draft, index) => (
                <SortableTopicRow
                  key={draft.key}
                  rowKey={draft.key}
                  index={index}
                  title={draft.title}
                  onChange={(title) => update(draft.key, title)}
                  onRemove={() =>
                    setDrafts((rows) =>
                      rows.filter((row) => row.key !== draft.key)
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrafts((rows) => [...rows, newDraft()])}
          >
            <Plus className="h-4 w-4" />
            {t('courses.live.addTopic')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={isSaving || !dirty}
          >
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>
    </SetupCard>
  );
}
