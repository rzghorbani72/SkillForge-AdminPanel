'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import type { SupportInboxSummary } from '@/lib/api';
import { TICKET_TEAMS, TicketTeam } from './staff-support-types';

export type InboxView = 'all' | 'mine' | 'unassigned';

interface Props {
  summary: SupportInboxSummary | null;
  view: InboxView;
  team: TicketTeam | null;
  showTeams: boolean;
  onViewChange: (view: InboxView) => void;
  onTeamChange: (team: TicketTeam | null) => void;
}

function Chip({
  active,
  count,
  label,
  onClick
}: {
  active: boolean;
  count?: number;
  label: string;
  onClick: () => void;
}) {
  const formatNumber = useNumberFormat();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'hover:bg-muted'
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 text-[11px]',
            active ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10'
          )}
        >
          {formatNumber(count)}
        </span>
      )}
    </button>
  );
}

/**
 * The two questions staff open the inbox with — "what is mine?" and "what is
 * my team's?" — answered as one row of chips instead of hidden in dropdowns.
 * Counts are open tickets only, so a resolved backlog never inflates them.
 */
export function InboxQueueBar({
  summary,
  view,
  team,
  showTeams,
  onViewChange,
  onTeamChange
}: Props) {
  const { t } = useTranslation();
  const teamCount = (value: TicketTeam) =>
    summary?.teams.find((row) => row.team === value)?.count ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label={t('support.views.all')}
          count={summary?.total}
          active={view === 'all'}
          onClick={() => onViewChange('all')}
        />
        <Chip
          label={t('support.views.mine')}
          count={summary?.mine}
          active={view === 'mine'}
          onClick={() => onViewChange('mine')}
        />
        <Chip
          label={t('support.views.unassigned')}
          count={summary?.unassigned}
          active={view === 'unassigned'}
          onClick={() => onViewChange('unassigned')}
        />
      </div>

      {showTeams && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-2">
          <span className="text-[11px] text-muted-foreground">
            {t('support.teamLabel')}
          </span>
          <Chip
            label={t('support.teams.ALL')}
            active={team === null}
            onClick={() => onTeamChange(null)}
          />
          {TICKET_TEAMS.map((value) => (
            <Chip
              key={value}
              label={t(`support.teams.${value}`)}
              count={teamCount(value)}
              active={team === value}
              onClick={() => onTeamChange(value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
