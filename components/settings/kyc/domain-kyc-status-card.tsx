'use client';

import Link from '@/components/ui/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import { KycStatusBadge } from '@/components/settings/kyc/kyc-readonly-panel';
import { useKyc } from '@/hooks/use-kyc';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { KYC_IDENTITY_PATH } from '@/lib/kyc-error';
import { useTranslation } from '@/lib/i18n/hooks';
import { KYC_STATUS } from '@/types/kyc';

/** Domain page gate: link to KYC when not yet verified. */
export function DomainKycStatusCard() {
  const { t } = useTranslation();
  const academy = useCurrentAcademy();
  const { state, isLoading } = useKyc(Boolean(academy?.id));

  if (!academy?.id) return null;

  if (isLoading) {
    return <Skeleton className="h-28 w-full" />;
  }

  if (!state) return null;

  const ready = state.status === KYC_STATUS.VERIFIED;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              {t('settings.kyc.title')}
            </CardTitle>
            <CardDescription>
              {ready ? t('settings.kyc.domainReady') : t('settings.kyc.domainBlocked')}
            </CardDescription>
          </div>
          <KycStatusBadge status={state.status} complete={state.settlement_eligible} />
        </div>
      </CardHeader>
      {!ready ? (
        <CardContent>
          <Button asChild size="sm">
            <Link href={KYC_IDENTITY_PATH}>{t('settings.kyc.goToIdentity')}</Link>
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
