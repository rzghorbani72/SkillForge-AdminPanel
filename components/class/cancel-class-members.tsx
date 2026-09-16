'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CancelClassMember } from '@/types/learning-operations';

export function CancelClassMembers({
  members,
  invited,
  onToggle,
}: {
  members: CancelClassMember[];
  invited: Set<string>;
  onToggle: (profileId: string, next: boolean) => void;
}) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto">
      {members.map((member) => {
        const complimentary = member.credit <= 0;
        return (
          <li
            key={member.engagement_id}
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{member.display_name ?? '—'}</p>
              <p className="text-xs text-muted-foreground">
                {complimentary
                  ? t(`tutoring.groups.cancelKind.${member.kind}`)
                  : t('tutoring.groups.cancelCreditAmount', {
                      amount: formatCurrency(member.credit),
                    })}
              </p>
            </div>
            {complimentary ? (
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={invited.has(member.student_profile_id)}
                  onCheckedChange={(value) => onToggle(member.student_profile_id, value === true)}
                />
                {t('tutoring.groups.cancelInviteCheck')}
              </label>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
