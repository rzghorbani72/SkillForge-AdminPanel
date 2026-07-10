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

function storagePercent(academy: AcademyHealthView): string {
  const storage = academy.limits?.storage_gb;
  if (!storage || storage.limit <= 0) return '—';
  const pct = Math.round((storage.used / storage.limit) * 100);
  return `${pct}%`;
}

export function AcademiesHealthTable() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<AcademyHealthView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getPlatformAcademiesHealth()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
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
                <TableHead>{t('academiesHealth.name')}</TableHead>
                <TableHead>{t('academiesHealth.plan')}</TableHead>
                <TableHead>{t('academiesHealth.expiry')}</TableHead>
                <TableHead>{t('academiesHealth.storage')}</TableHead>
                <TableHead>{t('academiesHealth.openTickets')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((academy) => (
                <TableRow key={academy.id}>
                  <TableCell className="font-medium">{academy.name}</TableCell>
                  <TableCell>{academy.plan_slug ?? '—'}</TableCell>
                  <TableCell>
                    {academy.expires_at
                      ? new Date(academy.expires_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>{storagePercent(academy)}</TableCell>
                  <TableCell>{academy.open_ticket_count ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
