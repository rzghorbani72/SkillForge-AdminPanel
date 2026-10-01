'use client';

import { Percent, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { CopyableVoucherCode } from '@/components/coupons/copyable-voucher-code';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  COUPON_TYPE_BADGE,
  COUPON_TYPE_LABEL_KEY,
  COUPON_STATUS_BADGE,
  COUPON_STATUS_LABEL_KEY,
  couponStatusOf,
  couponTypeOf,
} from '@/lib/coupons';
import type { Dispatch } from 'react';

export function CouponsTable({
  canManagePlatformVouchers,
  coupons,
  formatDate,
  formatNumber,
  formatPercent,
  loading,
  openEdit,
  setDeleteTarget,
}: {
  canManagePlatformVouchers: boolean;
  coupons: any[];
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (value: number) => string;
  loading: boolean;
  openEdit: (coupon: any) => void;
  setDeleteTarget: Dispatch<any>;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('coupons.allCoupons')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Percent className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{t('coupons.noCoupons')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('coupons.code')}</TableHead>
                <TableHead>{t('coupons.type')}</TableHead>
                <TableHead>{t('coupons.value')}</TableHead>
                {canManagePlatformVouchers && <TableHead>{t('coupons.academy')}</TableHead>}
                <TableHead>{t('coupons.uses')}</TableHead>
                <TableHead>{t('coupons.validity')}</TableHead>
                <TableHead>{t('coupons.status')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => {
                const status = couponStatusOf(c);
                return (
                  <TableRow key={c.id} className={status === 'active' ? undefined : 'opacity-60'}>
                    <TableCell>
                      <CopyableVoucherCode code={c.code} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={COUPON_TYPE_BADGE[couponTypeOf(c)]}
                        label={t(COUPON_TYPE_LABEL_KEY[couponTypeOf(c)])}
                      />
                    </TableCell>
                    <TableCell>
                      {c.coupon_type === 'FREE_TRIAL'
                        ? t('coupons.daysValue', {
                            count: c.free_trial_days ?? 0,
                          })
                        : c.coupon_type === 'FULL_DISCOUNT'
                          ? formatPercent(100)
                          : c.coupon_type === 'PERCENT'
                            ? formatPercent(c.discount_value ?? 0)
                            : formatNumber(c.discount_value ?? 0)}
                    </TableCell>
                    {canManagePlatformVouchers && (
                      <TableCell>{c.Academy?.name ?? t('coupons.platformScope')}</TableCell>
                    )}
                    <TableCell>
                      {c.usage_limit
                        ? `${formatNumber(c.used_count ?? 0)}/${formatNumber(c.usage_limit)}`
                        : formatNumber(c.used_count ?? 0)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.start_date && c.end_date
                        ? `${formatDate(c.start_date)} → ${formatDate(c.end_date)}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={COUPON_STATUS_BADGE[status]}
                        label={t(COUPON_STATUS_LABEL_KEY[status])}
                      />
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
