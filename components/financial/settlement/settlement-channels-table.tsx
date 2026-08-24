'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPaymentMethodLabel } from '@/lib/format-payment-method-label';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettlementChannel } from '@/lib/api-settlement';

interface SettlementChannelsTableProps {
  channels: SettlementChannel[];
  collectedTotal: number;
}

/**
 * Answers "where did my money come from, and who is holding it now".
 * Custody is the column that matters: only PLATFORM money is settleable.
 */
export function SettlementChannelsTable({
  channels,
  collectedTotal
}: SettlementChannelsTableProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();

  const rows = [...channels].sort((a, b) => b.gross - a.gross);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settlement.channels.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('settlement.channels.description')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('settlement.channels.method')}</TableHead>
                <TableHead>{t('settlement.channels.custody')}</TableHead>
                <TableHead className="text-end">
                  {t('settlement.channels.count')}
                </TableHead>
                <TableHead className="text-end">
                  {t('settlement.channels.gross')}
                </TableHead>
                <TableHead className="text-end">
                  {t('settlement.channels.share')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const share =
                  collectedTotal > 0 ? (row.gross / collectedTotal) * 100 : 0;
                return (
                  <TableRow key={row.method}>
                    <TableCell className="font-medium">
                      {formatPaymentMethodLabel(row.method, t)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.custody === 'PLATFORM' ? 'default' : 'secondary'
                        }
                      >
                        {t(`settlement.custody.${row.custody}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatNumber(row.count)}
                    </TableCell>
                    <TableCell className="text-end font-medium tabular-nums">
                      {formatCurrency(row.gross)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums text-muted-foreground">
                      {formatPercent(share)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
