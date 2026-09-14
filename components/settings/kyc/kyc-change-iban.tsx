'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import type { KycState, VerifiedIban } from '@/types/kyc';

type Props = {
  onSelected: (next: KycState) => void;
  onAddNew: () => void;
};

/** Verified panel footer: reuse a Sheba verified on another academy, or add one. */
export function KycChangeIban({ onSelected, onAddNew }: Props) {
  const { t, language } = useTranslation();
  const [ibans, setIbans] = useState<VerifiedIban[] | null>(null);
  const [busySheba, setBusySheba] = useState<string | null>(null);
  const digits = (value: string) => (language === 'fa' ? toPersianDigits(value) : value);

  useEffect(() => {
    apiClient
      .getVerifiedKycIbans()
      .then(setIbans)
      .catch((error: unknown) => {
        ErrorHandler.handleApiError(error);
        setIbans([]);
      });
  }, []);

  const select = async (sheba: string) => {
    setBusySheba(sheba);
    try {
      const next = await apiClient.selectKycIban(sheba);
      ErrorHandler.showSuccess(t('settings.kyc.ibanSelected'));
      onSelected(next);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusySheba(null);
    }
  };

  const others = ibans?.filter((iban) => !iban.is_current) ?? [];

  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className="text-sm font-semibold">{t('settings.kyc.changeIbanTitle')}</h4>
      <p className="text-xs text-muted-foreground">{t('settings.kyc.changeIbanNotice')}</p>

      {ibans === null ? (
        <Skeleton className="h-12 w-full" />
      ) : others.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('settings.kyc.verifiedIbansEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {others.map((iban) => (
            <li
              key={iban.sheba_number}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <div className="space-y-1">
                <p className="break-all font-medium">{digits(iban.sheba_number)}</p>
                <p className="text-xs text-muted-foreground">
                  {[iban.account_holder_name, iban.bank_name].filter(Boolean).join(' · ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.kyc.usedInAcademies', {
                    names: iban.academy_names.join('، '),
                  })}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busySheba !== null}
                onClick={() => void select(iban.sheba_number)}
              >
                {busySheba === iban.sheba_number
                  ? t('settings.kyc.verifying')
                  : t('settings.kyc.useIban')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="secondary" size="sm" onClick={onAddNew}>
        {t('settings.kyc.addNewIban')}
      </Button>
    </div>
  );
}
