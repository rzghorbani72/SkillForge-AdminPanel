'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { AcademyPolicyOverrides } from './academy-policy-overrides';
import { EnamadReviewPanel } from './enamad-review-panel';
import { KycStaffPanel } from './kyc-staff-panel';
import type {
  ContentKind,
  EnamadStatus,
  ModerationPolicy,
  ModerationPolicyMap,
  ReviewQueueItem,
} from '@/types/compliance';
import type { KycState } from '@/types/kyc';

type Props = {
  item: ReviewQueueItem | null;
  onClose: () => void;
  /** Lets the queue refresh once a decision changes what it should show. */
  onChanged: () => void;
};

/** Everything staff can decide about ONE academy: KYC, eNamad, upload policy. */
export function AcademyComplianceDialog({ item, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const [defaults, setDefaults] = useState<ModerationPolicyMap | null>(null);
  const [overrides, setOverrides] = useState<Partial<ModerationPolicyMap>>({});
  const [enamadStatus, setEnamadStatus] = useState<EnamadStatus | null>(null);
  const [kyc, setKyc] = useState<KycState | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingKind, setSavingKind] = useState<ContentKind | null>(null);
  const [savingEnamad, setSavingEnamad] = useState(false);

  const academyId = item?.academy_id ?? null;

  const load = useCallback(async () => {
    if (!academyId) return;
    setLoading(true);
    try {
      const [platformDefaults, academyOverrides, academyKyc] = await Promise.all([
        apiClient.getModerationDefaults(),
        apiClient.getAcademyModerationPolicy(academyId),
        apiClient.getAcademyKyc(academyId),
      ]);
      setDefaults(platformDefaults);
      setOverrides(academyOverrides);
      setKyc(academyKyc);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    if (!item) return;
    setEnamadStatus(item.enamad_status);
    setKyc(null);
    void load();
  }, [item, load]);

  const changePolicy = async (kind: ContentKind, policy: ModerationPolicy | null) => {
    if (!academyId) return;
    setSavingKind(kind);
    try {
      setOverrides(
        await apiClient.setAcademyModerationPolicy(academyId, {
          content_kind: kind,
          policy,
        }),
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSavingKind(null);
    }
  };

  const reviewEnamad = async (approved: boolean, note: string) => {
    if (!academyId) return;
    setSavingEnamad(true);
    try {
      const next = await apiClient.reviewAcademyEnamad(academyId, {
        approved,
        note: note || undefined,
      });
      setEnamadStatus(next.status);
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSavingEnamad(false);
    }
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('compliance.manage.title')}</DialogTitle>
          <DialogDescription>
            {item?.academy_name}
            {item?.custom_domain ? ` — ${item.custom_domain}` : ''}
          </DialogDescription>
        </DialogHeader>

        {loading || !item ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('compliance.kyc.title')}</h3>
              {kyc ? <KycStaffPanel state={kyc} /> : <Skeleton className="h-20 w-full" />}
            </section>

            <Separator />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('compliance.enamad.title')}</h3>
              <EnamadReviewPanel
                item={item}
                status={enamadStatus ?? item.enamad_status}
                submitting={savingEnamad}
                onReview={reviewEnamad}
              />
            </section>

            <Separator />

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">{t('compliance.override.title')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('compliance.override.description')}
              </p>
              <AcademyPolicyOverrides
                defaults={defaults}
                overrides={overrides}
                saving={savingKind}
                onChange={changePolicy}
              />
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
