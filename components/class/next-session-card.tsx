'use client';

import { CalendarClock, Link2, Radio, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { useOpenClassMeeting } from '@/hooks/use-open-class-meeting';
import { classProgress } from '@/lib/class-sessions';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { ClassJoinTarget, ClassSession } from '@/types/learning-operations';

interface NextSessionCardProps {
  sessions: ClassSession[];
  /** The class-wide link, used by any meeting that has none of its own. */
  classMeetingUrl?: string | null;
  /** The room the join button asks the server to sign a link for. */
  joinTarget: ClassJoinTarget;
}

/**
 * What a teacher needs the moment they open a class: which meeting is next (or
 * running), which link that meeting will actually use, and how much of the term
 * is left. Everything else on the page is editing; this is just answering.
 */
export function NextSessionCard({ sessions, classMeetingUrl, joinTarget }: NextSessionCardProps) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const progress = classProgress(sessions);
  const session = progress.current ?? progress.next;

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  const link = session?.meeting_url || classMeetingUrl || null;
  const meeting = useOpenClassMeeting(joinTarget);

  const when = session
    ? new Intl.DateTimeFormat(language, {
        dateStyle: 'full',
        timeStyle: 'short',
        hourCycle: 'h23',
        timeZone: session.timezone,
      }).format(new Date(session.starts_at))
    : null;

  return (
    <DataPanel
      title={progress.current ? t('courses.live.sessionNow') : t('courses.live.nextSession')}
      subtitle={t('courses.live.sessionsRemaining', {
        count: formatNumber(progress.remaining),
      })}
    >
      <div className="space-y-4 p-5">
        {session ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {progress.current ? (
                  <Radio className="h-4 w-4 shrink-0 animate-pulse text-rose-600" />
                ) : (
                  <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                )}
                <span className="truncate text-base font-semibold">
                  {session.title?.trim() || when}
                </span>
              </div>
              {session.title?.trim() ? (
                <span className="text-sm text-muted-foreground">{when}</span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {session.meeting_url ? (
                  <Link2 className="h-3 w-3" />
                ) : (
                  <Video className="h-3 w-3" />
                )}
                {session.meeting_url
                  ? t('courses.live.usesOwnLink')
                  : classMeetingUrl
                    ? t('courses.live.usesClassLink')
                    : t('courses.live.noLinkYet')}
              </Badge>
              {link ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={meeting.opening}
                  onClick={() => void meeting.open()}
                >
                  {t('courses.live.openLink')}
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {progress.total ? t('courses.live.allSessionsDone') : t('courses.live.noSessionsYet')}
          </p>
        )}

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            {t('courses.live.sessionsDone', {
              done: formatNumber(progress.done),
              total: formatNumber(progress.total),
            })}
          </p>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </DataPanel>
  );
}
