'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import type { KycIbanInfo } from '@/types/kyc';

type Props = {
  info: KycIbanInfo;
  shebaNumber: string | null;
};

export function KycIbanConfirmCard({ info, shebaNumber }: Props) {
  const { t, language } = useTranslation();
  const fa = language === 'fa';
  const sheba = shebaNumber ? (fa ? toPersianDigits(shebaNumber) : shebaNumber) : '—';

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">{t('settings.kyc.ibanInfoTitle')}</p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">{t('settings.kyc.accountHolder')}</dt>
          <dd className="font-medium">{info.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('settings.kyc.bankName')}</dt>
          <dd className="font-medium">{info.bank_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('settings.kyc.sheba')}</dt>
          <dd className="break-all font-medium">{sheba}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('settings.kyc.ibanActive')}</dt>
          <dd className="font-medium">
            {info.active ? t('settings.kyc.ibanActiveYes') : t('settings.kyc.ibanActiveNo')}
          </dd>
        </div>
      </dl>
      {info.active ? (
        <p className="text-xs text-muted-foreground">{t('settings.kyc.ibanConfirmHint')}</p>
      ) : (
        <p className="flex items-start gap-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {t('settings.kyc.ibanInactiveHint')}
        </p>
      )}
    </div>
  );
}
