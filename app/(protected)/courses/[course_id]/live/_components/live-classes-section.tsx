'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Course } from '@/types/api';
import type { ClassRequest, TutoringGroup, TutoringOffer } from '@/types/learning-operations';
import { classOfferSource, type ScheduleBuilderPrefill } from '../hooks/use-schedule-builder';
import { ClassListCard } from './class-list-card';
import { ClassRequestsCard, requestPrefill } from './class-requests-card';
import ScheduleBuilder from './schedule-builder';

type ClassDraft = { prefill?: ScheduleBuilderPrefill; request?: ClassRequest };

interface LiveClassesSectionProps {
  courseId: string;
  course: Course;
  offers: TutoringOffer[];
  groups: TutoringGroup[];
  onReload: () => void;
}

/**
 * Every class of a live course on one page: student requests, the create form
 * and the list. The form is part of the page, not a modal, so it can be as
 * tall as it needs. With no class yet, the form is simply open.
 */
export function LiveClassesSection({
  courseId,
  course,
  offers,
  groups,
  onReload,
}: LiveClassesSectionProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ClassDraft | null>(null);
  const [requestsVersion, setRequestsVersion] = useState(0);
  const formRef = useRef<HTMLElement>(null);
  const hasClasses = groups.length > 0;
  const formOpen = draft !== null || !hasClasses;

  useEffect(() => {
    if (draft) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [draft]);

  const acceptRequest = async (request: ClassRequest, groupId: string) => {
    try {
      await apiClient.acceptClassRequest(request.id, groupId);
      toast.success(t('courses.live.requestAccepted'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
    setRequestsVersion((version) => version + 1);
  };

  const onCreated = async (groupId: string) => {
    if (draft?.request) await acceptRequest(draft.request, groupId);
    setDraft(null);
    onReload();
  };

  return (
    <div className="space-y-6">
      <ClassRequestsCard
        key={requestsVersion}
        courseId={courseId}
        onOpenClass={(request) => setDraft({ prefill: requestPrefill(request), request })}
      />

      {formOpen ? (
        <section ref={formRef} className="scroll-mt-4 space-y-6 rounded-2xl border bg-card p-5">
          <header className="space-y-1">
            <h2 className="text-lg font-semibold">
              {t(hasClasses ? 'courses.live.createClass' : 'courses.live.createFirstClass')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('courses.live.scheduleHint')}</p>
          </header>
          <ScheduleBuilder
            key={draft?.request?.id ?? 'new'}
            offer={classOfferSource(courseId, course, offers)}
            courseTitle={course.title}
            coursePublished={Boolean(course.is_published)}
            defaultSeatPrice={offers.find((offer) => offer.kind === 'GROUP')?.price}
            prefill={draft?.prefill}
            onOfferCreated={onReload}
            onCreated={(groupId) => void onCreated(groupId)}
            onCancel={hasClasses ? () => setDraft(null) : undefined}
          />
        </section>
      ) : null}

      {hasClasses ? (
        <ClassListCard
          courseId={courseId}
          coursePublished={Boolean(course.is_published)}
          groups={groups}
          onChanged={onReload}
          action={
            formOpen ? null : (
              <Button type="button" size="sm" onClick={() => setDraft({})}>
                <Plus className="me-1.5 h-4 w-4" />
                {t('courses.live.createClass')}
              </Button>
            )
          }
        />
      ) : null}
    </div>
  );
}
