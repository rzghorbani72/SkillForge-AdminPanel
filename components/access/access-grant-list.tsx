'use client';

import { Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { GroupAccessGrant, StudentAccessGrant } from '@/lib/api-extra';

type AccessGrantListProps = {
  students: StudentAccessGrant[];
  groups: GroupAccessGrant[];
  onRevoke: (target: { profile_id?: string; group_id?: string }) => void;
  isBusy?: boolean;
};

/** Who currently holds hand-given access to a course, and how to take it back. */
export function AccessGrantList({
  students,
  groups,
  onRevoke,
  isBusy = false
}: AccessGrantListProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  if (students.length === 0 && groups.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        {t('accessGrants.noGrants')}
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-md border">
      {groups.map((grant) => (
        <li key={grant.grant_id} className="flex items-center gap-3 p-3">
          <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{grant.name}</p>
            <p className="text-xs text-muted-foreground">
              {t('accessGrants.memberCount', { count: String(grant.members) })}
            </p>
          </div>
          <ExpiryBadge expiresAt={grant.expires_at} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isBusy}
            aria-label={t('accessGrants.revoke')}
            onClick={() => onRevoke({ group_id: grant.group_id })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </li>
      ))}

      {students.map((grant) => (
        <li key={grant.enrollment_id} className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {grant.name || t('accessGrants.unknownStudent')}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(grant.granted_at)}
              {grant.note ? ` — ${grant.note}` : ''}
            </p>
          </div>
          <ExpiryBadge expiresAt={grant.expires_at} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isBusy}
            aria-label={t('accessGrants.revoke')}
            onClick={() => onRevoke({ profile_id: grant.profile_id })}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  if (expiresAt === null) {
    return (
      <Badge variant="secondary">{t('accessGrants.durationForever')}</Badge>
    );
  }
  const hasExpired = new Date(expiresAt).getTime() <= Date.now();
  return (
    <Badge variant={hasExpired ? 'destructive' : 'outline'}>
      {hasExpired
        ? t('accessGrants.expired')
        : t('accessGrants.until', { date: formatDate(expiresAt) })}
    </Badge>
  );
}
