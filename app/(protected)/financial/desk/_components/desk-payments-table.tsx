'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIranMoney } from '@/app/(protected)/analytics/_hooks/use-iran-money';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import type { LedgerPaymentsResponse } from '@/types/financial';

type DeskPaymentsTableProps = {
  data: LedgerPaymentsResponse;
  loading: boolean;
  onLoadMore: () => void;
};

export function DeskPaymentsTable({ data, loading, onLoadMore }: DeskPaymentsTableProps) {
  const { t } = useTranslation();
  const { formatToman, formatRial } = useIranMoney();
  const formatDate = useDateFormat();
  const hasMore = data.page * data.limit < data.total;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('financial.desk.paidAt')}</TableHead>
            <TableHead>{t('financial.desk.academy')}</TableHead>
            <TableHead>{t('financial.desk.kind')}</TableHead>
            <TableHead>{t('financial.desk.gross')}</TableHead>
            <TableHead>{t('financial.desk.academyShare')}</TableHead>
            <TableHead>{t('financial.desk.platformShare')}</TableHead>
            <TableHead>{t('financial.desk.bankDetail')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && data.payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                {t('financial.desk.noPayments')}
              </TableCell>
            </TableRow>
          ) : (
            data.payments.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {formatDate(row.paid_at, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{row.academy_name ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.course_title ?? row.gateway ?? '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {row.kind === 'platform_plan'
                      ? t('financial.desk.kindPlan')
                      : t('financial.desk.kindSale')}
                  </Badge>
                </TableCell>
                <TableCell>{formatToman(row.gross_amount)}</TableCell>
                <TableCell>{formatToman(row.academy_share)}</TableCell>
                <TableCell>{formatToman(row.platform_share)}</TableCell>
                <TableCell className="text-xs">
                  <div>{formatRial(row.bank_amount)}</div>
                  <div className="text-muted-foreground">{row.bank_ref ?? '—'}</div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {hasMore ? (
        <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loading}>
          {t('financial.desk.loadMore')}
        </Button>
      ) : null}
    </div>
  );
}
