'use client';

import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import {
  KycReadonlyPanel,
  KycStatusBadge
} from '@/components/settings/kyc/kyc-readonly-panel';
import { KycWizardForm } from '@/components/settings/kyc/kyc-wizard-form';
import { useKyc } from '@/hooks/use-kyc';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  enabled: boolean;
};

/** KYC block embedded on the profile page (merged with account settings). */
export function ProfileKycSection({ enabled }: Props) {
  const { t } = useTranslation();
  const { state, isLoading, reload } = useKyc(enabled);

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
          {state ? <KycStatusBadge status={state.status} /> : null}
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
        ) : state.can_edit ? (
          <KycWizardForm
            initial={state}
            onSubmitted={() => {
              void reload();
            }}
          />
        ) : (
          <KycReadonlyPanel state={state} />
        )}
      </CardContent>
    </Card>
  );
}
