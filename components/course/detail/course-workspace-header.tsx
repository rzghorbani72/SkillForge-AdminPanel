'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Radio,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseTypePill } from '@/components/course/course-type-pill';
import { StatusPill } from '@/components/course/StatusPill';
import { courseHue } from '@/components/course/courseUtils';
import { langApiVersionPath } from '@/lib/api-lang';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { CoursePublishButton } from './course-publish-button';
import { CourseQuickSettingsDialog } from './course-quick-settings-dialog';
import { CourseWorkspaceTabs } from './course-workspace-tabs';
import { useCourseWorkspace } from './course-workspace-context';
import type { CourseDetail } from './types';

function thumbUrl(course: CourseDetail): string | null {
  const image = course.Image;
  if (!image) return null;
  return image.publicUrl ?? `${langApiVersionPath()}/images/fetch-image-by-id/${image.id}`;
}

/**
 * Stays mounted across every course tab, so switching from the overview to the
 * builder feels like moving inside the course, not leaving it. `sticky` is off
 * on the builder, which pins its own step bar to the top instead — and the
 * builder hides the tabs too, so the step indicator is the only bar there.
 */
export function CourseWorkspaceHeader({
  sticky = true,
  showTabs = true,
}: {
  sticky?: boolean;
  showTabs?: boolean;
}) {
  const { t } = useTranslation();
  const { courseId, course, loading } = useCourseWorkspace();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading && !course) {
    return (
      <div className="border-b bg-background px-4 pt-4 sm:px-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-4 h-9 w-full max-w-md" />
      </div>
    );
  }

  if (!course) return null;

  const thumb = thumbUrl(course);
  const hue = courseHue(course.id);
  const isLive = course.course_type === 'LIVE';
  const base = `/courses/${courseId}`;

  return (
    <div
      className={cn(
        'border-b bg-background/95 px-4 pt-3 backdrop-blur sm:px-6',
        sticky && 'sticky top-0 z-20',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" className="-ms-2 h-8 w-8 shrink-0" asChild>
          <Link href="/courses" aria-label={t('courseDetail.backToCourses')}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>

        <div
          className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md"
          style={{
            background: thumb
              ? undefined
              : `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`,
          }}
        >
          {thumb ? (
            <Image
              src={thumb}
              alt={course.Image?.alt ?? course.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-4 w-4 opacity-40" style={{ color: `hsl(${hue} 60% 40%)` }} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{course.title}</h1>
          <StatusPill status={course.is_published ? 'PUBLISHED' : 'DRAFT'} />
          <CourseTypePill type={course.course_type} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showTabs && (
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link href={`${base}/edit`}>
                <Pencil className="me-1.5 h-4 w-4" />
                {t('courses.wizard.tabBuilder')}
              </Link>
            </Button>
          )}
          <CoursePublishButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label={t('courseDetail.moreActions')}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
                <Settings2 className="me-2 h-4 w-4" />
                {t('courseDetail.quickSettings')}
              </DropdownMenuItem>
              {isLive && (
                <DropdownMenuItem asChild>
                  <Link href={`${base}/live`}>
                    <Radio className="me-2 h-4 w-4" />
                    {t('courseDetail.manageClassroom')}
                  </Link>
                </DropdownMenuItem>
              )}
              {course.is_published && course.slug && (
                <DropdownMenuItem asChild>
                  <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="me-2 h-4 w-4" />
                    {t('courseDetail.viewPublicPage')}
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showTabs ? <CourseWorkspaceTabs courseId={courseId} /> : <div className="h-3" />}

      <CourseQuickSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
