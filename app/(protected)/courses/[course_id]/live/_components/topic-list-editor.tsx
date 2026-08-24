'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseTopic } from '@/types/learning-operations';

type Draft = { id?: string; title: string };

interface TopicListEditorProps {
  courseId: string;
  initial: CourseTopic[];
  onSaved?: (topics: CourseTopic[]) => void;
}

/**
 * The syllabus a live course promises. Saved as one list rather than row by
 * row, so reordering and renaming are a single call the backend can validate
 * against the meetings already named after a topic.
 */
export default function TopicListEditor({
  courseId,
  initial,
  onSaved
}: TopicListEditorProps) {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((topic) => ({ id: topic.id, title: topic.title }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const update = (index: number, title: string) =>
    setDrafts((rows) =>
      rows.map((row, i) => (i === index ? { ...row, title } : row))
    );

  const save = async () => {
    const topics = drafts
      .map((row) => ({ ...row, title: row.title.trim() }))
      .filter((row) => row.title);
    if (!topics.length) {
      toast.error(t('courses.live.topicsRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const saved = await apiClient.replaceCourseTopics(courseId, topics);
      setDrafts(saved.map((topic) => ({ id: topic.id, title: topic.title })));
      onSaved?.(saved);
      toast.success(t('courses.live.topicsSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('courses.live.topics')}</CardTitle>
        <CardDescription>{t('courses.live.topicsHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {drafts.map((draft, index) => (
          <div
            key={draft.id ?? `new-${index}`}
            className="flex items-center gap-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-6 shrink-0 text-sm text-muted-foreground">
              {index + 1}
            </span>
            <Input
              value={draft.title}
              onChange={(e) => update(index, e.target.value)}
              placeholder={t('courses.live.topicPlaceholder')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('common.delete')}
              onClick={() =>
                setDrafts((rows) => rows.filter((_, i) => i !== index))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDrafts((rows) => [...rows, { title: '' }])}
          >
            <Plus className="h-4 w-4" />
            {t('courses.live.addTopic')}
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={isSaving}>
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
