'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useIranMoney } from '@/app/(protected)/analytics/_hooks/use-iran-money';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useTranslation } from '@/lib/i18n/hooks';
import type { DeskAcademyRow, DeskSettlementRow } from '@/types/financial';

type DeskSettlementsProps = {
  academies: DeskAcademyRow[];
  settlements: DeskSettlementRow[];
  notifyingId: string | null;
  onNotify: (id: string) => void;
};

function InformedBadges({
  informed,
  sms,
  email
}: {
  informed: boolean;
  sms: boolean;
  email: boolean;
}) {
  const { t } = useTranslation();
  if (!informed) {
    return <Badge variant="outline">{t('financial.desk.notInformed')}</Badge>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      <Badge>{t('financial.desk.informed')}</Badge>
      {sms ? (
        <Badge variant="secondary">{t('financial.desk.sms')}</Badge>
      ) : null}
      {email ? (
        <Badge variant="secondary">{t('financial.desk.email')}</Badge>
      ) : null}
    </div>
  );
}

export function DeskAcademiesTable({
  academies,
  notifyingId,
  onNotify
}: Pick<DeskSettlementsProps, 'academies' | 'notifyingId' | 'onNotify'>) {
  const { t } = useTranslation();
  const { formatTomanFromRial } = useIranMoney();
  const formatDate = useDateFormat();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('financial.desk.academy')}</TableHead>
          <TableHead>{t('financial.desk.toDeposit')}</TableHead>
          <TableHead>{t('financial.desk.pending')}</TableHead>
          <TableHead>{t('financial.desk.settledAt')}</TableHead>
          <TableHead>{t('financial.desk.trackingCode')}</TableHead>
          <TableHead>{t('financial.desk.informed')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {academies.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              {t('financial.desk.noAcademies')}
            </TableCell>
          </TableRow>
        ) : (
          academies.map((row) => (
            <TableRow key={row.academy_id}>
              <TableCell className="font-medium">{row.academy_name}</TableCell>
              <TableCell>{formatTomanFromRial(row.to_deposit)}</TableCell>
              <TableCell>{formatTomanFromRial(row.pending_amount)}</TableCell>
              <TableCell className="text-xs">
                {row.last_settled_at
                  ? formatDate(row.last_settled_at, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '—'}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {row.last_tracking_code ?? '—'}
              </TableCell>
              <TableCell>
                <InformedBadges
                  informed={row.informed}
                  sms={row.informed_sms}
                  email={row.informed_email}
                />
              </TableCell>
              <TableCell className="text-right">
                {row.last_withdrawal_id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={notifyingId === row.last_withdrawal_id}
                    onClick={() => {
                      if (row.last_withdrawal_id) {
                        onNotify(row.last_withdrawal_id);
                      }
                    }}
                  >
                    {t('financial.desk.inform')}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function DeskPaidTable({
  settlements,
  notifyingId,
  onNotify
}: Pick<DeskSettlementsProps, 'settlements' | 'notifyingId' | 'onNotify'>) {
  const { t } = useTranslation();
  const { formatTomanFromRial } = useIranMoney();
  const formatDate = useDateFormat();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('financial.desk.academy')}</TableHead>
          <TableHead>{t('financial.desk.amount')}</TableHead>
          <TableHead>{t('financial.desk.settledAt')}</TableHead>
          <TableHead>{t('financial.desk.trackingCode')}</TableHead>
          <TableHead>{t('financial.desk.informed')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settlements.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground"
            >
              {t('financial.desk.noSettlements')}
            </TableCell>
          </TableRow>
        ) : (
          settlements.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.academy_name}</TableCell>
              <TableCell>{formatTomanFromRial(row.amount)}</TableCell>
              <TableCell className="text-xs">
                {row.processed_at
                  ? formatDate(row.processed_at, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '—'}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {row.tracking_code ?? '—'}
              </TableCell>
              <TableCell>
                <InformedBadges
                  informed={row.informed}
                  sms={row.informed_sms}
                  email={row.informed_email}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={notifyingId === row.id}
                  onClick={() => onNotify(row.id)}
                >
                  {t('financial.desk.inform')}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
