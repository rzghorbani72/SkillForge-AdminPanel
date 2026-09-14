'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDateTime } from '@/lib/utils';
import { logger } from '@/lib/logging/app-logger';
import type { TeacherPayoutRecord } from '@/types/teacher-earnings';

/** Mirrors TEACHER_REJECT_WAIT_HOURS on the backend (bank settlement cycle). */
const REJECT_WAIT_HOURS = 72;

type Props = { payout: TeacherPayoutRecord; onChanged: () => void };

/**
 * Teacher's answer to a recorded payout. Confirm is instant; reject is held
 * until the bank cycle has passed, so a slow transfer is not undone by mistake.
 */
export function PayoutResponseActions({ payout, onChanged }: Props) {
  const { t, language } = useTranslation();
  const [busy, setBusy] = useState(false);

  if (payout.status !== 'PAID') return null;
  if (payout.teacher_confirmed_at) {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">
        {t('teacherEarnings.confirmedAt', {
          date: formatDateTime(payout.teacher_confirmed_at, language),
        })}
      </span>
    );
  }

  const paidAt = new Date(payout.processed_at ?? payout.requested_at);
  const rejectOpensAt = new Date(paidAt.getTime() + REJECT_WAIT_HOURS * 3_600_000);
  const canReject = Date.now() >= rejectOpensAt.getTime();

  const run = async (action: 'confirm' | 'reject') => {
    setBusy(true);
    try {
      if (action === 'confirm') {
        await apiClient.confirmTeacherPayout(payout.id);
      } else {
        await apiClient.rejectRecordedTeacherPayout(payout.id);
      }
      logger.ok('TeacherPayout', 'TeacherAnswered', { action });
      toast.success(t(`teacherEarnings.${action}Done`));
      onChanged();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" disabled={busy} onClick={() => run('confirm')}>
          {t('teacherEarnings.confirm')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !canReject}
          onClick={() => run('reject')}
        >
          {t('teacherEarnings.reject')}
        </Button>
      </div>
      {!canReject ? (
        <span className="text-[11px] text-muted-foreground">
          {t('teacherEarnings.rejectWaitHint', {
            date: formatDateTime(rejectOpensAt, language),
          })}
        </span>
      ) : null}
    </div>
  );
}
