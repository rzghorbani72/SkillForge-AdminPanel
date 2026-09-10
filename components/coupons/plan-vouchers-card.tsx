'use client';

import { Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useRedeemablePlanVouchers } from '@/hooks/use-redeemable-plan-vouchers';
import {
  COUPON_TYPE_BADGE,
  COUPON_TYPE_LABEL_KEY,
  couponTypeOf,
  type CouponSummary
} from '@/lib/coupons';

/**
 * The read-only half of the coupon split: vouchers Mentoma minted for this
 * manager's own plan pay/upgrade. The manager can use them, never edit them —
 * student checkout codes are managed separately at /coupons.
 */
export function PlanVouchersCard() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const formatPercent = usePercentLabel();
  const { vouchers, loading } = useRedeemablePlanVouchers();

  function valueOf(voucher: CouponSummary): string {
    const type = couponTypeOf(voucher);
    if (type === 'FREE_TRIAL') {
      return t('coupons.daysValue', {
        count: voucher.free_trial_days ?? 0
      });
    }
    if (type === 'FULL_DISCOUNT') return formatPercent(100);
    if (type === 'PERCENT') return formatPercent(voucher.discount_value ?? 0);
    return formatNumber(voucher.discount_value ?? 0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('coupons.myPlanVouchers')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('coupons.myPlanVouchersHint')}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Ticket className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('coupons.noPlanVouchers')}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('coupons.code')}</TableHead>
                <TableHead>{t('coupons.type')}</TableHead>
                <TableHead>{t('coupons.value')}</TableHead>
                <TableHead>{t('coupons.validUntil')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.code}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={COUPON_TYPE_BADGE[couponTypeOf(voucher)]}
                      label={t(COUPON_TYPE_LABEL_KEY[couponTypeOf(voucher)])}
                    />
                  </TableCell>
                  <TableCell>{valueOf(voucher)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {voucher.end_date ? formatDate(voucher.end_date) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
