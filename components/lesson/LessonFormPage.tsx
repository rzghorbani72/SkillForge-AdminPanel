'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import LessonForm from './LessonForm';
import { LessonFormData } from './schema';
import type { Course, Lesson, Season } from '@/types/api';

type Props = {
  initialValues: LessonFormData;
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  season?: Season | null;
  course?: Course | null;
  isEdit: boolean;
  lesson?: Lesson | null;
  onLiveSessionSaved?: () => void;
  children?: React.ReactNode;
};

const LessonFormPage = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  season,
  course,
  isEdit,
  lesson,
  onLiveSessionSaved,
  children
}: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const lessonsPath = `/courses/${courseId}/seasons/${seasonId}/lessons`;

  const breadcrumb = [
    { label: t('courses.title'), href: '/courses' },
    { label: course?.title ?? '—', href: `/courses/${courseId}` },
    { label: t('courses.seasons'), href: `/courses/${courseId}/seasons` },
    {
      label: season?.title ?? '—',
      href: `/courses/${courseId}/seasons/${seasonId}`
    },
    { label: t('courses.lessons'), href: lessonsPath }
  ];

  const subtitleParams = {
    season: season?.title ?? '—',
    course: course?.title ?? '—'
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(crumb.href)}
              className="max-w-[16rem] truncate transition-colors hover:text-foreground"
            >
              {crumb.label}
            </button>
            <span aria-hidden>/</span>
          </span>
        ))}
        <span className="font-medium text-foreground">
          {isEdit
            ? t('courses.lessonForm.editTitle')
            : t('courses.lessonForm.createTitle')}
        </span>
      </nav>

      <div className="flex min-w-0 items-start gap-3">
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onCancel}
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('courses.backToLessons')}
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {isEdit
              ? t('courses.lessonForm.editTitle')
              : t('courses.lessonForm.createTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? t('courses.lessonForm.editSubtitle', subtitleParams)
              : t('courses.lessonForm.createSubtitle', subtitleParams)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LessonForm
            initialValues={initialValues}
            categories={categories}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel={
              isEdit
                ? t('courses.lessonForm.updateAction')
                : t('courses.lessonForm.createAction')
            }
            liveSessionLessonId={lesson?.id}
            serverLessonType={lesson?.lesson_type}
            liveSessionInitial={lesson?.LiveSession ?? null}
            onLiveSessionSaved={onLiveSessionSaved}
          />
          {children}
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" />
                {t('courses.lessonForm.sidebarTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t('courses.courseLabel')}
                </p>
                <p className="text-sm font-semibold">{course?.title ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {t('courses.season')}
                </p>
                <p className="text-sm font-semibold">{season?.title ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4" />
                {t('courses.lessonForm.tipsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span aria-hidden className="text-muted-foreground/60">
                      •
                    </span>
                    <span>{t(`courses.lessonForm.${tip}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonFormPage;
