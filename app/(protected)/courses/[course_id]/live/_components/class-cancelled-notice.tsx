'use client';

import { AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import type { TutoringGroup } from '@/types/learning-operations';

type Props = {
  group: TutoringGroup;
  busy: boolean;
  onReopen: () => Promise<boolean>;
};

function useDeadlineMessage(group: TutoringGroup): string {
  const { t } = useTranslation();
  const deadline = group.join_deadline ? formatDate(group.join_deadline) : '';
  const registered = group.members?.length ?? 0;
  if (registered === 0) return t('tutoring.groups.cancelledByDeadlineNoOne', { deadline });
  return t('tutoring.groups.cancelledByDeadlineRefunded', {
    deadline,
    students: formatNumber(registered),
    refunded: formatNumber(group.refunds?.students ?? 0),
    amount: formatCurrency(group.refunds?.amount ?? 0),
  });
}

export function ClassCancelledNotice({ group, busy, onReopen }: Props) {
  const { t } = useTranslation();
  const deadlineMessage = useDeadlineMessage(group);
  if (group.status !== 'CANCELLED') return null;

  const byDeadline = group.cancel_reason === 'MINIMUM_NOT_REACHED';
  const reopen = async () => {
    if (await onReopen()) toast.success(t('tutoring.groups.classReopened'));
  };

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {byDeadline
          ? t('tutoring.groups.cancelledByDeadlineTitle')
          : t('tutoring.groups.cancelledTitle')}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {byDeadline
            ? deadlineMessage
            : (group.cancel_reason ?? t('tutoring.groups.cancelledHint'))}
        </p>
        {byDeadline && (
          <>
            <p>{t('tutoring.groups.reopenHint')}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void reopen()}
            >
              {t('tutoring.groups.reopenClass')}
            </Button>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
