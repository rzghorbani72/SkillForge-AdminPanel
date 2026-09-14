'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import { KycReadonlyPanel, KycStatusBadge } from '@/components/settings/kyc/kyc-readonly-panel';
import { KycChangeIban } from '@/components/settings/kyc/kyc-change-iban';
import { KycWizardForm } from '@/components/settings/kyc/kyc-wizard-form';
import { Button } from '@/components/ui/button';
import { useKyc } from '@/hooks/use-kyc';
import { useTranslation } from '@/lib/i18n/hooks';
import { KYC_STATUS, type KycState } from '@/types/kyc';

type Props = {
  enabled: boolean;
};

/** KYC block embedded on the profile page (merged with account settings). */
export function ProfileKycSection({ enabled }: Props) {
  const { t } = useTranslation();
  const { state, isLoading, setState } = useKyc(enabled);
  const [addingIban, setAddingIban] = useState(false);
  const verified = state?.status === KYC_STATUS.VERIFIED;
  const showWizard = Boolean(state?.is_owner) && (!verified || addingIban);

  const applyState = (next: KycState) => {
    setState(next);
    if (next.status === KYC_STATUS.VERIFIED && !next.pending_sheba_number) {
      setAddingIban(false);
    }
  };

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (window.location.hash !== '#kyc') return;
    const el = document.getElementById('kyc');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [enabled, isLoading, state]);

  if (!enabled) return null;

  return (
    <Card id="kyc">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          {t('settings.kyc.formTitle')}
          {state ? (
            <KycStatusBadge status={state.status} complete={state.settlement_eligible} />
          ) : null}
        </CardTitle>
        <CardDescription>{t('settings.kyc.formDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !state ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : showWizard ? (
          <div className="space-y-4">
            <KycWizardForm initial={state} onSubmitted={applyState} />
            {addingIban ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddingIban(false)}>
                {t('settings.kyc.cancelChangeIban')}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <KycReadonlyPanel state={state} />
            {state.pending_sheba_number ? (
              <p className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
                {t('settings.kyc.pendingIbanNotice')}
              </p>
            ) : null}
            {state.is_owner ? (
              <KycChangeIban onSelected={applyState} onAddNew={() => setAddingIban(true)} />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
