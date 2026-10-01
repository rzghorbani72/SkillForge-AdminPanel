'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n/hooks';
import type { AcademyPayment } from '@/types/financial';
import { CourseRevenueBucket } from '../_lib/page-helpers';

export function RevenueTabs({
  canSeeAnyRevenue,
  formatCurrency,
  formatDate,
  formatNumber,
  payments,
  paymentsByCourse,
}: {
  canSeeAnyRevenue: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (isoString: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  payments: AcademyPayment[];
  paymentsByCourse: CourseRevenueBucket[];
}) {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="payments" className="space-y-4">
      <TabsList>
        <TabsTrigger value="payments">{t('financial.store.revenue.allPayments')}</TabsTrigger>
        <TabsTrigger value="courses">{t('financial.store.revenue.revenueByCourse')}</TabsTrigger>
      </TabsList>

      <TabsContent value="payments">
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.revenue.allPayments')}</CardTitle>
            <CardDescription>{t('financial.store.revenue.paymentsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.payments.date')}</TableHead>
                  <TableHead>{t('financial.store.payments.student')}</TableHead>
                  <TableHead>{t('financial.store.payments.course')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.payments.amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      {t('financial.store.payments.noPayments')}
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(p.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.profile?.display_name ?? '—'}
                      </TableCell>
                      <TableCell>{p.course?.title ?? '—'}</TableCell>
                      <TableCell className="text-end font-medium">
                        {canSeeAnyRevenue ? formatCurrency(p.amount, p.currency) : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="courses">
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.revenue.revenueByCourse')}</CardTitle>
            <CardDescription>
              {t('financial.store.revenue.revenueByCourseDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.payments.course')}</TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.revenue.payments')}
                  </TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.revenue.totalRevenue')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsByCourse.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                      {t('financial.store.revenue.noCourseRevenue')}
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentsByCourse.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.course}</TableCell>
                      <TableCell className="text-end">
                        <Badge variant="secondary">{formatNumber(c.count)}</Badge>
                      </TableCell>
                      <TableCell className="text-end font-medium">
                        {canSeeAnyRevenue ? formatCurrency(c.total, c.currency) : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
