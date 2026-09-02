'use client';

import { Button } from '@/components/ui/button';
import { DataList } from '@/components/shared/data-list/data-list';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';
import type { TutoringGroupMember } from '@/types/learning-operations';

type Props = {
  members: TutoringGroupMember[];
  busy: boolean;
  onRemove: (profileId: string) => void;
};

export const GroupRosterCard = ({ members, busy, onRemove }: Props) => {
  const { t, language } = useTranslation();
  const live = members.filter(
    (member) => member.status === 'PENDING' || member.status === 'ACTIVE'
  );

  return (
    <DataPanel
      title={t('tutoring.groups.rosterTitle')}
      subtitle={t('tutoring.groups.rosterSubtitle')}
    >
      <DataList
        items={live}
        rowKey={(member) => member.id}
        emptyState={
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t('tutoring.groups.rosterEmpty')}
          </p>
        }
        columns={[
          {
            id: 'student',
            header: t('tutoring.groups.columnStudent'),
            cell: (member) => member.Student?.display_name ?? '—'
          },
          {
            id: 'seats',
            header: t('tutoring.groups.columnBookedSeats'),
            cell: (member) => formatNumber(member.seats_claimed, language),
            align: 'center'
          },
          {
            id: 'status',
            header: t('tutoring.groups.columnStatus'),
            cell: (member) =>
              t(`tutoring.groups.memberStatus.${member.status}`),
            align: 'center'
          },
          {
            id: 'actions',
            header: '',
            align: 'end',
            cell: (member) =>
              member.Student ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => onRemove(member.Student!.id)}
                >
                  {t('tutoring.groups.removeStudent')}
                </Button>
              ) : null
          }
        ]}
        renderCard={(member) => (
          <div className="space-y-1 rounded-xl border p-4">
            <p className="font-medium">{member.Student?.display_name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.columnBookedSeats')}:{' '}
              {formatNumber(member.seats_claimed, language)} ·{' '}
              {t(`tutoring.groups.memberStatus.${member.status}`)}
            </p>
            {member.Student ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onRemove(member.Student!.id)}
              >
                {t('tutoring.groups.removeStudent')}
              </Button>
            ) : null}
          </div>
        )}
      />
    </DataPanel>
  );
};
