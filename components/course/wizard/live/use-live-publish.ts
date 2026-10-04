'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { tryPublishClass } from '@/app/(protected)/courses/[course_id]/live/hooks/publish-draft-classes';
import { useTranslation } from '@/lib/i18n/hooks';
import type { useCourseForm } from '../../useCourseForm';
import type { LiveClassDraftApi } from './use-live-class-draft';

type CourseForm = ReturnType<typeof useCourseForm>;

/**
 * Order matters: the classes must exist before the course can be published, and
 * the course must be published before a class can go on sale. If no class can
 * go on sale (e.g. a teacher time clash), the course goes back to draft so
 * students never see a course with nothing to buy.
 */
export function useLivePublish(
  live: LiveClassDraftApi,
  course: CourseForm,
  saveCourse: () => Promise<boolean>,
) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const run = async (task: () => Promise<void>) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await task();
    } finally {
      setIsBusy(false);
    }
  };

  const saveDraft = () =>
    run(async () => {
      if (!(await saveCourse())) return;
      if (!(await live.save())) return;
      toast.success(t('liveWizard.draftSaved'));
      router.push('/courses');
    });

  const publish = () =>
    run(async () => {
      if (!(await saveCourse())) return;
      const groups = await live.save();
      if (!groups) return;
      const wasPublished = course.form.getValues('published');
      if (!wasPublished) {
        await course.togglePublish(true);
        if (!course.form.getValues('published')) return;
      }
      let failed = 0;
      // One at a time, so the teacher-clash check sees the class published just before.
      for (const group of groups) {
        if (group.status === 'DRAFT' && !(await tryPublishClass(group.id))) failed += 1;
      }
      if (failed > 0 && failed === groups.length) {
        if (!wasPublished) await course.togglePublish(false);
        toast.error(t('liveWizard.publishRolledBack'));
        return;
      }
      if (failed > 0) toast.warn(t('liveWizard.someClassesNotPublished'));
      await live.reload();
      if (wasPublished) toast.success(t('liveWizard.changesSaved'));
      else setJustPublished(true);
    });

  return { isBusy, justPublished, saveDraft, publish };
}

export type LivePublishApi = ReturnType<typeof useLivePublish>;
