'use client';

import Link from 'next/link';
import { CalendarClock, Radio, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupScheduleSummary } from '@/components/class/group-schedule-summary';
import { GroupStatusBadge } from '@/components/class/group-status-badge';
import { GroupTermRange } from '@/components/class/group-term-range';
import { SeatMeter } from '@/components/class/seat-meter';
import { LiveSetupChecklist } from '@/components/course/live/live-setup-checklist';
import { nextClass } from '@/components/course/live/live-class-stats';
import type { LiveSetupStep } from '@/components/course/live/live-setup-steps';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { TutoringGroup } from '@/types/learning-operations';

interface CourseLiveClassroomProps {
  courseId: string;
  groups: TutoringGroup[];
  steps: readonly LiveSetupStep[];
  loading: boolean;
  /** Recorded lessons left from before the course was switched to live. */
  leftoverLessons: number;
}

/**
 * A live course is taught from a timetable, so the overview answers the two
 * questions a teacher opens it with — is this course ready to sell, and which
 * class meets next — instead of pointing at another page to find out.
 */
export function CourseLiveClassroom({
  courseId,
  groups,
  steps,
  loading,
  leftoverLessons
}: CourseLiveClassroomProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const ready = steps.every((step) => step.done);
  const upcoming = nextClass(groups);

  if (loading) return <Skeleton className="h-40 w-full rounded-2xl" />;

  if (!ready) {
    return (
      <div className="space-y-3">
        <LiveSetupChecklist steps={steps} />
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/courses/${courseId}/live`}>
            {t('courseDetail.continueSetup')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Radio className="h-4 w-4 text-primary" />
          {t('courseDetail.classroom')}
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/courses/${courseId}/live`}>
            {t('courseDetail.manageClassroom')}
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcoming ? (
          <Link
            href={`/courses/${courseId}/live/${upcoming.id}`}
            className="block rounded-xl border bg-muted/30 p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t('courseDetail.nextClass')}
              </p>
              <GroupStatusBadge status={upcoming.status} />
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold">
              {upcoming.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                <GroupTermRange
                  startsOn={upcoming.starts_on}
                  endsOn={upcoming.ends_on}
                />
              </span>
              <GroupScheduleSummary
                slots={upcoming.Slots}
                className="min-w-0"
              />
              <span className="inline-flex items-center gap-1.5">
                {upcoming.meeting_url ? (
                  <Video className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <VideoOff className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                )}
                {upcoming.meeting_url
                  ? t('courseDetail.meetingLinkSet')
                  : t('courseDetail.meetingLinkMissing')}
              </span>
            </div>
            <SeatMeter
              className="mt-3"
              taken={upcoming.seats_taken}
              capacity={upcoming.capacity}
            />
          </Link>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
            {t('courseDetail.noUpcomingClass')}
          </p>
        )}

        {leftoverLessons > 0 && (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            {t('courseDetail.liveLeftoverLessons', {
              count: formatNumber(leftoverLessons)
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
