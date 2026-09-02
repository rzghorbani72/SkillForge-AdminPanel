'use client';

import { Course, Season } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

const LessonNavigation = ({
  courseId,
  course,
  seasonId,
  season,
  router
}: {
  courseId: string;
  course: Course;
  seasonId: string;
  season: Season;
  router: { push: (href: string) => void };
}) => {
  const { t } = useTranslation();

  const crumbs = [
    { label: t('navigation.courses'), href: '/courses' },
    { label: course.title, href: `/courses/${courseId}` },
    { label: t('courses.seasons'), href: `/courses/${courseId}/seasons` },
    { label: season.title, href: `/courses/${courseId}/seasons/${seasonId}` }
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <button
            onClick={() => router.push(crumb.href)}
            className="max-w-[12rem] truncate transition-colors hover:text-foreground"
          >
            {crumb.label}
          </button>
          <span aria-hidden>/</span>
        </span>
      ))}
      <span className="font-medium text-foreground">
        {t('courses.lessons')}
      </span>
    </nav>
  );
};

export default LessonNavigation;
