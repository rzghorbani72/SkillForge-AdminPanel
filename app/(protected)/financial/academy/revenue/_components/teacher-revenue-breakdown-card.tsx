'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { TeacherRevenueRow, MonetizationSummary } from '../_lib/page-helpers';

export function TeacherRevenueBreakdownCard({
  formatCurrency,
  formatNumber,
  monetizationSummary,
  revenueCurrency,
  teacherRows,
  toggleTeacherVisibility,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  monetizationSummary: MonetizationSummary | null;
  revenueCurrency: string;
  teacherRows: TeacherRevenueRow[];
  toggleTeacherVisibility: (row: TeacherRevenueRow) => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financial.store.revenue.teacherRevenueBreakdown')}</CardTitle>
        <CardDescription>
          {t('financial.store.revenue.teacherRevenueBreakdownDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('financial.store.revenue.teacher')}</TableHead>
              <TableHead className="text-end">{t('financial.store.revenue.payments')}</TableHead>
              <TableHead className="text-end">
                {t('financial.store.revenue.teacherRevenue')}
              </TableHead>
              <TableHead className="text-end">{t('financial.store.revenue.visibility')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teacherRows.map((row) => (
              <TableRow key={row.teacher_id}>
                <TableCell className="font-medium">
                  {row.teacher_name ?? `${t('financial.store.revenue.teacher')} #${row.teacher_id}`}
                </TableCell>
                <TableCell className="text-end">
                  <Badge variant="secondary">{formatNumber(row.payment_count ?? 0)}</Badge>
                </TableCell>
                <TableCell className="text-end font-medium">
                  {row.revenue_visible === false
                    ? '—'
                    : formatCurrency(Number(row.payout_revenue ?? 0), revenueCurrency)}
                </TableCell>
                <TableCell className="text-end">
                  {monetizationSummary?.role === 'MANAGER' ? (
                    <Button variant="ghost" size="sm" onClick={() => toggleTeacherVisibility(row)}>
                      {row.revenue_visible === false ? (
                        <Eye className="mr-1.5 h-4 w-4" />
                      ) : (
                        <EyeOff className="mr-1.5 h-4 w-4" />
                      )}
                      {row.revenue_visible === false
                        ? t('financial.store.revenue.showAmount')
                        : t('financial.store.revenue.hideAmount')}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
