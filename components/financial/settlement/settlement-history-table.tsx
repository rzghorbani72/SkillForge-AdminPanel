'use client';

import { Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { maskSheba } from '@/lib/mask-sheba';
import type { WithdrawalRecord } from '@/lib/api-settlement';

interface SettlementHistoryTableProps {
  records: WithdrawalRecord[];
}

/** The audit trail the manager can point at when money is questioned. */
export function SettlementHistoryTable({
  records
}: SettlementHistoryTableProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useDateFormat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settlement.history.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Banknote className="mb-3 h-9 w-9" />
            <p className="text-sm">{t('settlement.history.empty')}</p>
          </div>
        ) : (
          <div className="table-h-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('settlement.history.requestedAt')}</TableHead>
                  <TableHead>{t('settlement.history.amount')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('settlement.history.settledAt')}</TableHead>
                  <TableHead>{t('settlement.history.destination')}</TableHead>
                  <TableHead>{t('settlement.history.bankRef')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.requested_at)}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={record.status.toLowerCase()}
                        label={t(`settlement.status.${record.status}`)}
                      />
                    </TableCell>
                    <TableCell>
                      {record.processed_at
                        ? formatDate(record.processed_at)
                        : '—'}
                    </TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">
                      {maskSheba(record.sheba_number)}
                    </TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">
                      {record.bank_transaction_code ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
