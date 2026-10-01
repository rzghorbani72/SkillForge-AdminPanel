'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Dispatch } from 'react';
import { paymentStatusLabel, formatDisplayUuid, PaymentNotes } from '../_lib/page-helpers';

export function SelectedPaymentSheet({
  formatCurrency,
  selectedPayment,
  selectedPaymentNotes,
  setSelectedPayment,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  selectedPayment: any;
  selectedPaymentNotes: PaymentNotes | null;
  setSelectedPayment: Dispatch<any>;
}) {
  const { t, language } = useTranslation();
  return (
    <Sheet
      open={!!selectedPayment}
      onOpenChange={(open) => {
        if (!open) setSelectedPayment(null);
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {t('payments.detailTitle', {
              student:
                selectedPayment?.user?.display_name ??
                selectedPayment?.Profile?.display_name ??
                t('payments.unknownStudent'),
            })}
          </SheetTitle>
          <SheetDescription>{t('payments.detailDescription')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-2 py-4 text-sm">
          <div>
            {t('payments.colUuid')}: {formatDisplayUuid(selectedPayment?.uuid, language)}
          </div>
          <div>
            {t('payments.colStatus')}: {paymentStatusLabel(selectedPayment?.status, t)}
          </div>
          <div>
            {t('payments.colGatewayRef')}: {selectedPayment?.gateway_id || '-'}
          </div>
          <div>
            {t('payments.detailAuthority')}: {selectedPayment?.authority || '-'}
          </div>
          <div>
            {t('payments.detailPlatformCommission')}:{' '}
            {formatCurrency(
              selectedPayment?.financials?.platform_commission ??
                selectedPayment?.platform_fee ??
                0,
            )}
          </div>
          {selectedPayment?.credit_amount ? (
            <div>
              {t('payments.creditApplied')}: {formatCurrency(selectedPayment.credit_amount)}
            </div>
          ) : null}
          <div>
            {t('payments.detailVat')}:{' '}
            {formatCurrency(selectedPayment?.financials?.vat_amount ?? 0)}
          </div>
          <div>
            {t('payments.detailAcademyRevenue')}:{' '}
            {formatCurrency(selectedPayment?.financials?.academy_revenue ?? 0)}
          </div>
          {selectedPaymentNotes ? (
            <>
              <div>
                {t('payments.detailFlow')}: {selectedPaymentNotes.s || '-'}
              </div>
              <div>
                {t('payments.detailPricingProfile')}: {selectedPaymentNotes.p || '-'}
              </div>
              <div>
                {t('payments.detailMarket')}: {selectedPaymentNotes.m || '-'}
              </div>
              <div>
                {t('payments.detailAffiliateFee')}: {formatCurrency(selectedPaymentNotes.a ?? 0)}
              </div>
              <div>
                {t('payments.detailPlatformFee')}: {formatCurrency(selectedPaymentNotes.pf ?? 0)}
              </div>
              <div>
                {t('payments.detailInstructorShare')}:{' '}
                {formatCurrency(selectedPaymentNotes.tp ?? 0)}
              </div>
              <div>
                {t('payments.detailNetSettlement')}: {formatCurrency(selectedPaymentNotes.sn ?? 0)}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
