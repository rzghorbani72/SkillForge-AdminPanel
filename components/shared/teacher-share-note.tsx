'use client';

import { Info } from 'lucide-react';
import Link from '@/components/ui/link';
import { TEACHER_SHARE_HREF } from '@/components/settings/academy-teacher-share-card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { canAccessFinance } from '@/lib/roles';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';

type Props = { className?: string };

/**
 * One line on every money view telling the teacher which share of each sale
 * is theirs. Managers can open Settlement to change the rate.
 */
export function TeacherShareNote({ className }: Props) {
  const { t } = useTranslation();
  const percent = usePercentLabel();
  const academy = useCurrentAcademy();
  const { user } = useAuthUser();
  const rate = academy?.teacher_share_rate;
  if (rate === undefined || rate === null) return null;

  const canEdit = canAccessFinance(user);

  return (
    <p
      className={cn('flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground', className)}
    >
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>
        {t('teacherShare.note', {
          teacher: percent(rate * 100),
          academy: percent((1 - rate) * 100),
        })}
      </span>
      {canEdit ? (
        <Link
          href={TEACHER_SHARE_HREF}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t('teacherShare.changeRate')}
        </Link>
      ) : null}
    </p>
  );
}
