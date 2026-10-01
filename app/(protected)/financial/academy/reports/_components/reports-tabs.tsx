'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ReportsTabs({
  formatCurrency,
  formatNumber,
  monthlyBreakdown,
  records,
  summary,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  monthlyBreakdown: {
    revenue: number;
    cost: number;
    profit: number;
    currency: string;
    month: number;
    monthName: string;
  }[];
  records: any[];
  summary: any;
}) {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList>
        <TabsTrigger value="summary">{t('financial.store.reports.summary')}</TabsTrigger>
        <TabsTrigger value="monthly">{t('financial.store.reports.monthly')}</TabsTrigger>
        <TabsTrigger value="records">{t('financial.store.reports.records')}</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.reports.financialSummary')}</CardTitle>
            <CardDescription>
              {t('financial.store.reports.financialSummaryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('financial.store.reports.totalRevenueLabel')}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.total_revenue || 0, summary.currency || 'IRR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('financial.store.reports.totalCostLabel')}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary.total_cost || 0, summary.currency || 'IRR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('financial.store.reports.netProfit')}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.total_profit || 0, summary.currency || 'IRR')}
                    </p>
                  </div>
                </div>
                {summary.record_count !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('financial.store.reports.totalRecords')}
                    </p>
                    <p className="text-xl font-semibold">{formatNumber(summary.record_count)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('financial.store.reports.noSummaryData')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthly" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.reports.monthlyBreakdown')}</CardTitle>
            <CardDescription>
              {t('financial.store.reports.monthlyBreakdownDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.reports.month')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.revenue')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.cost')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.profit')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t('financial.store.reports.noMonthlyData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyBreakdown.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.monthName}</TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(month.revenue, month.currency)}
                      </TableCell>
                      <TableCell className="text-end text-red-600">
                        {formatCurrency(month.cost, month.currency)}
                      </TableCell>
                      <TableCell className="text-end font-medium text-green-600">
                        {formatCurrency(month.profit, month.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="records" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('financial.store.reports.allFinancialRecords')}</CardTitle>
            <CardDescription>
              {t('financial.store.reports.allFinancialRecordsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('financial.store.reports.period')}</TableHead>
                  <TableHead>{t('financial.store.reports.category')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.revenue')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.cost')}</TableHead>
                  <TableHead className="text-end">{t('financial.store.reports.profit')}</TableHead>
                  <TableHead className="text-end">
                    {t('financial.store.reports.finalProfit')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {t('financial.store.reports.noRecords')}
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{new Date(record.period_start).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              to {new Date(record.period_end).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.costCategory?.name || t('financial.store.reports.uncategorized')}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(record.revenue, record.currency)}
                      </TableCell>
                      <TableCell className="text-end text-red-600">
                        {formatCurrency(record.cost, record.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        {formatCurrency(record.profit, record.currency)}
                      </TableCell>
                      <TableCell className="text-end font-medium text-green-600">
                        {formatCurrency(record.final_profit, record.currency)}
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
