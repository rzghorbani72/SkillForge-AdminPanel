'use client';

import { Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseDetailSeason } from './types';
import { countLessons } from './types';

type CourseLiveSummaryProps = {
  seasons: CourseDetailSeason[];
  onManage: () => void;
};

/**
 * A live course is taught from a timetable, not a lesson list, so the overview
 * points at the classroom instead of the curriculum. Recorded lessons left over
 * from before the course was switched to live are called out rather than shown
 * as its syllabus — they are not what students get here.
 */
export function CourseLiveSummary({
  seasons,
  onManage
}: CourseLiveSummaryProps) {
  const { t } = useTranslation();
  const leftoverLessons = countLessons(seasons);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Radio className="h-4 w-4 text-primary" />
            {t('courseDetail.classroom')}
          </CardTitle>
          <CardDescription>{t('courseDetail.liveSummary')}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onManage}>
          {t('courseDetail.manageClassroom')}
        </Button>
      </CardHeader>
      {leftoverLessons > 0 && (
        <CardContent>
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            {t('courseDetail.liveLeftoverLessons', {
              count: formatNumber(leftoverLessons)
            })}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
