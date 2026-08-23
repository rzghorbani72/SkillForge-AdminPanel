'use client';

import { use } from 'react';
import Link from 'next/link';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { formatNumber } from '@/lib/utils';
import { GroupScheduleSummary } from '../_components/group-schedule-summary';
import { GroupStatusBadge } from '../_components/group-status-badge';
import { GroupRosterCard } from './_components/group-roster-card';
import { GroupActionsCard } from './_components/group-actions-card';
import { useGroupDetail } from './hooks/use-group-detail';

export default function TutoringGroupDetailPage({
  params
}: {
  params: Promise<{ group_id: string }>;
}) {
  const { group_id: groupId } = use(params);
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const formatDate = useDateFormat();
  const detail = useGroupDetail(groupId);
  const group = detail.group;

  const seatsNeeded = group
    ? Math.max(group.min_students - group.seats_taken, 0)
    : 0;

  return (
    <LearningNavGate requiredCapability="tutoring">
      <main className="space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <Link
          href="/tutoring/groups"
          className="text-sm text-muted-foreground hover:underline"
        >
          {t('tutoring.groups.backToList')}
        </Link>

        {detail.loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : !group ? (
          <p className="text-sm text-muted-foreground">
            {t('tutoring.groups.notFound')}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {group.title}
                </h1>
                <GroupStatusBadge status={group.status} />
              </div>
              <GroupScheduleSummary slots={group.Slots} />
            </div>

            <DataPanel
              title={t('tutoring.groups.summaryTitle')}
              subtitle={
                group.status === 'WAITING' && seatsNeeded > 0
                  ? t('tutoring.groups.needsMore')
                  : undefined
              }
            >
              <dl className="grid gap-4 p-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('tutoring.groups.columnSeats')}
                  </dt>
                  <dd className="text-lg font-semibold">
                    {formatNumber(group.seats_taken, language)} /{' '}
                    {formatNumber(group.capacity, language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('tutoring.groups.columnMin')}
                  </dt>
                  <dd className="text-lg font-semibold">
                    {formatNumber(group.min_students, language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t('tutoring.groups.startsOn')}
                  </dt>
                  <dd className="text-lg font-semibold">
                    {group.starts_on ? formatDate(group.starts_on) : '—'}
                  </dd>
                </div>
                {group.age_min || group.age_max ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t('tutoring.groups.ageRange')}
                    </dt>
                    <dd>
                      {formatNumber(group.age_min ?? 0, language)}–
                      {formatNumber(group.age_max ?? 0, language)}
                    </dd>
                  </div>
                ) : null}
                {group.join_code ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t('tutoring.groups.joinCode')}
                    </dt>
                    <dd className="font-mono text-sm" dir="ltr">
                      {group.join_code}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </DataPanel>

            <GroupRosterCard
              members={group.members ?? []}
              busy={detail.busy}
              onRemove={(profileId) => void detail.removeMember(profileId)}
            />

            <GroupActionsCard
              group={group}
              busy={detail.busy}
              onUpdateLink={(url, notify) =>
                void detail.updateLink(url, notify)
              }
              onAnnounce={(body, sms) => void detail.announce(body, sms)}
              onConfirm={() => void detail.confirm()}
              onCancel={(reason) => void detail.cancel(reason)}
            />

            <DataPanel title={t('tutoring.groups.sessionsTitle')}>
              <ul className="divide-y">
                {(group.sessions ?? []).map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <span>
                      {formatDate(session.starts_at, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {t(`tutoring.groups.sessionStatus.${session.status}`)}
                    </span>
                  </li>
                ))}
                {!(group.sessions ?? []).length ? (
                  <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                    {t('tutoring.groups.sessionsEmpty')}
                  </li>
                ) : null}
              </ul>
            </DataPanel>
          </>
        )}
      </main>
    </LearningNavGate>
  );
}
