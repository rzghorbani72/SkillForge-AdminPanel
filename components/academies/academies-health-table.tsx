'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, AcademyHealthView } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { CopyableId } from './copyable-id';

function storagePercent(
  academy: AcademyHealthView,
  formatPercent: (value: number) => string
): string {
  const storage = academy.limits?.storage_gb;
  if (!storage || storage.limit <= 0) return '—';
  return formatPercent((storage.used / storage.limit) * 100);
}

export function AcademiesHealthTable() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const [rows, setRows] = useState<AcademyHealthView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await apiClient.getPlatformAcademiesHealth();
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('academiesHealth.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            {t('support.loading')}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('academiesHealth.empty')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('academiesHealth.row')}</TableHead>
                <TableHead>{t('academiesHealth.id')}</TableHead>
                <TableHead>{t('academiesHealth.name')}</TableHead>
                <TableHead>{t('academiesHealth.plan')}</TableHead>
                <TableHead>{t('academiesHealth.expiry')}</TableHead>
                <TableHead>{t('academiesHealth.storage')}</TableHead>
                <TableHead>{t('academiesHealth.openTickets')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((academy, index) => (
                <TableRow key={academy.id}>
                  <TableCell className="tabular-nums">
                    {formatNumber(index + 1)}
                  </TableCell>
                  <TableCell>
                    <CopyableId value={academy.id} className="max-w-[180px]" />
                  </TableCell>
                  <TableCell className="font-medium">{academy.name}</TableCell>
                  <TableCell>
                    {getPlanDisplayName(academy.plan_slug) ?? '—'}
                  </TableCell>
                  <TableCell>
                    {academy.expires_at
                      ? formatDate(academy.expires_at, { month: 'numeric' })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {storagePercent(academy, formatPercent)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {academy.open_ticket_count == null
                      ? '—'
                      : formatNumber(academy.open_ticket_count)}
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
