'use client';

import { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiClient } from '@/lib/api';
import { resolveApiErrorMessage } from '@/lib/api-error';
import { currentLanguage } from '@/lib/current-language';

export interface TrialContext {
  holder_academy_id: string | null;
  holder_academy_name: string | null;
  expires_at: string | null;
  transferable: boolean;
}

interface TrialMoveCardProps {
  academyId: string;
  academyName: string;
  trial: TrialContext | null | undefined;
  onMoved: () => void;
}

function daysLeft(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/**
 * The owner holds ONE free trial. When it is unspent, or running on a different
 * academy, this offers to spend or move it here. The confirmation is blunt on
 * purpose: moving costs the other academy its access and adds no new days.
 */
export function TrialMoveCard({
  academyId,
  academyName,
  trial,
  onMoved
}: TrialMoveCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!trial?.transferable) return null;

  const isMove = !!trial.holder_academy_id;
  const remaining = daysLeft(trial.expires_at);

  async function apply() {
    setSaving(true);
    try {
      await apiClient.claimAcademyTrial(academyId);
      toast.success(t('plans.trial.applied'));
      setConfirming(false);
      onMoved();
    } catch (error) {
      toast.error(resolveApiErrorMessage(error, currentLanguage()));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Gift className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {isMove ? t('plans.trial.moveTitle') : t('plans.trial.claimTitle')}
          </p>
          <p className="text-sm text-muted-foreground">
            {isMove
              ? t('plans.trial.moveDescription', {
                  academy: trial.holder_academy_name ?? '',
                  days: formatNumber(remaining)
                })
              : t('plans.trial.claimDescription')}
          </p>
        </div>
        <Button size="sm" onClick={() => setConfirming(true)}>
          {isMove ? t('plans.trial.moveCta') : t('plans.trial.claimCta')}
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isMove
                ? t('plans.trial.moveTitle')
                : t('plans.trial.claimTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isMove
                ? t('plans.trial.moveConfirm', {
                    from: trial.holder_academy_name ?? '',
                    to: academyName,
                    days: formatNumber(remaining)
                  })
                : t('plans.trial.claimConfirm', { academy: academyName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void apply();
              }}
              disabled={saving}
            >
              {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
