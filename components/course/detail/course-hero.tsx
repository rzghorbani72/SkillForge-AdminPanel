'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Star, Tag, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { courseHue } from '@/components/course/courseUtils';
import { renderMarkdown } from '@/lib/markdown';
import { langApiVersionPath } from '@/lib/api-lang';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { CourseDetail } from './types';

type CourseHeroProps = {
  course: CourseDetail;
};

function coverUrl(course: CourseDetail): string | null {
  const image = course.Image;
  if (!image) return null;
  if (image.publicUrl) return image.publicUrl;
  return `${langApiVersionPath()}/images/fetch-image-by-id/${image.id}`;
}

export function CourseHero({ course }: CourseHeroProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hue = courseHue(course.id);
  const cover = coverUrl(course);
  const teacher = course.Profile?.display_name ?? null;
  const category = course.Category?.name ?? null;
  const description = course.description?.trim() ?? '';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 md:flex-row">
        <div
          className="relative aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl md:w-64 lg:w-72"
          style={{
            background: cover
              ? undefined
              : `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`
          }}
        >
          {cover ? (
            <Image
              src={cover}
              alt={course.Image?.alt ?? course.title}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen
                className="h-10 w-10 opacity-40"
                style={{ color: `hsl(${hue} 60% 40%)` }}
              />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {course.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    <Star className="h-3 w-3" />
                    {t('courses.featured')}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {category}
                  </span>
                )}
                {teacher && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <User className="h-3 w-3" />
                    {teacher}
                  </span>
                )}
              </div>
            </div>
          </div>

          {description ? (
            <div>
              <div
                className={cn(
                  'prose-description text-sm text-muted-foreground',
                  expanded ? 'max-h-[500px] overflow-y-auto' : 'line-clamp-3'
                )}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(description)
                }}
              />
              {description.length > 180 && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  {expanded
                    ? t('courseDetail.showLess')
                    : t('courseDetail.showMore')}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('courseDetail.noDescription')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
