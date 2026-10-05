'use client';

import { useCallback, useEffect, useState } from 'react';

import { DataPanel } from '@/components/shared/data-list';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { CourseQnA } from '@/types/learning-operations';
import { CourseQuestionRow } from './course-question-row';

/** Questions visitors asked on the public course page, unanswered first. */
export function CourseQuestionsCard({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [items, setItems] = useState<CourseQnA[]>([]);

  const load = useCallback(async () => {
    try {
      const rows = await apiClient.getCourseQnAs(courseId);
      setItems([...rows].sort((a, b) => Number(Boolean(a.answer)) - Number(Boolean(b.answer))));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unanswered = items.filter((item) => !item.answer).length;

  return (
    <DataPanel
      title={t('courseDetail.questionsTitle')}
      subtitle={t('courseDetail.questionsUnanswered', { count: formatNumber(unanswered) })}
    >
      {items.length === 0 ? (
        <p className="border-t px-5 py-6 text-sm text-muted-foreground">
          {t('courseDetail.questionsEmpty')}
        </p>
      ) : (
        <ul className="divide-y border-t">
          {items.map((item) => (
            <CourseQuestionRow key={item.id} item={item} onChanged={load} />
          ))}
        </ul>
      )}
    </DataPanel>
  );
}
