'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Input } from '@/components/ui/input';
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
  /** Renders without its own card, for a parent that already frames it. */
  bare?: boolean;
}

let localKeySeq = 0;
const newDraft = (): Draft => ({ key: `new-${localKeySeq++}`, title: '' });

/** What the server holds, so an edit can be told apart from a reorder-free visit. */
const signature = (rows: readonly { title: string }[]) =>
  rows.map((row) => row.title.trim()).join('\u0000');

/**
 * The syllabus a live course promises. Autosaved as one ordered list rather
 * than row by row, so reordering and renaming are a single call the backend
 * can validate against the meetings already named after a topic.
 */
export default function TopicListEditor({
  courseId,
  initial,
  onSaved,
  bare = false,
}: TopicListEditorProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((topic) => ({
      key: topic.id,
      id: topic.id,
      title: topic.title,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [nextTitle, setNextTitle] = useState('');
  const [saved, setSaved] = useState(() => signature(initial));
  const sensors = useSensors(useSensor(PointerSensor));
  const dirty = useMemo(
    () => signature(drafts.filter((row) => row.title.trim())) !== saved,
    [drafts, saved],
  );

  const update = (key: string, title: string) =>
    setDrafts((rows) => rows.map((row) => (row.key === key ? { ...row, title } : row)));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = drafts.findIndex((row) => row.key === active.id);
    const to = drafts.findIndex((row) => row.key === over.id);
    if (from === -1 || to === -1) return;
    const next = [...drafts];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDrafts(next);
    void save(next);
  };

  const addTopic = () => {
    const title = nextTitle.trim();
    if (!title) return;
    const next = [...drafts, { ...newDraft(), title }];
    setDrafts(next);
    setNextTitle('');
    void save(next);
  };

  const remove = (key: string) => {
    const next = drafts.filter((row) => row.key !== key);
    setDrafts(next);
    void save(next);
  };

  // Autosave: runs on blur, remove and reorder. Order is the list order, so
  // what the teacher sees is the order a student is promised.
  const save = async (rows: Draft[] = drafts) => {
    const filled = rows.filter((row) => row.title.trim());
    if (isSaving || !filled.length || signature(filled) === saved) return;
    setIsSaving(true);
    try {
      const result = await apiClient.replaceCourseTopics(
        courseId,
        filled.map((row) => ({ id: row.id, title: row.title.trim() })),
      );
      // Keep row keys so the field being typed in is not remounted.
      let next = 0;
      setDrafts((current) =>
        current.map((row) =>
          row.title.trim() ? { ...row, id: result[next++]?.id ?? row.id } : row,
        ),
      );
      setSaved(signature(result));
      onSaved?.(result);
      toast.success(t('courses.live.topicsSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const list = (
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
                onBlur={() => void save()}
                onRemove={() => remove(draft.key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Input
        value={nextTitle}
        onChange={(e) => setNextTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          addTopic();
        }}
        onBlur={addTopic}
        placeholder={t('courses.live.nextTopicPlaceholder')}
        aria-label={t('courses.live.addTopic')}
      />
    </div>
  );

  if (bare) return list;

  return (
    <SetupCard
      title={t('courses.live.topics')}
      description={t('courses.live.topicsHint')}
      done={drafts.some((row) => row.title.trim()) && !dirty}
      dirty={dirty}
    >
      {list}
    </SetupCard>
  );
}
