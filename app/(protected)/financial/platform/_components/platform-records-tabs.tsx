'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { StoreFinancialRecord, PlatformFinancialRecord } from '@/types/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { profitMargin } from '../_lib/page-helpers';

export function PlatformRecordsTabs({
  formatCurrency,
  loadData,
  platformRecords,
  storeRecords,
}: {
  formatCurrency: (amount: number, currency?: string) => string;
  loadData: () => Promise<void>;
  platformRecords: PlatformFinancialRecord[];
  storeRecords: StoreFinancialRecord[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Tabs defaultValue="platform" className="space-y-4">
      <TabsList>
        <TabsTrigger value="platform">{t('financial.platform.tabs.platformRecords')}</TabsTrigger>
        <TabsTrigger value="stores">{t('financial.platform.tabs.allStores')}</TabsTrigger>
      </TabsList>

      <TabsContent value="platform">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>{t('financial.platform.platformRecords.period')}</TableHead>
                <TableHead>{t('financial.platform.platformRecords.category')}</TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.platformRecords.revenue')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.platformRecords.cost')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.platformRecords.profit')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.platformRecords.margin')}
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {t('financial.platform.platformRecords.noRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                platformRecords.map((record) => {
                  const m = profitMargin(record.revenue, record.cost);
                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell className="text-sm">
                        {new Date(record.period_start).toLocaleDateString()} –{' '}
                        {new Date(record.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.costCategory ? (
                          <Badge variant="outline">{record.costCategory.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end font-medium tabular-nums">
                        {formatCurrency(record.revenue, record.currency)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums text-destructive">
                        {formatCurrency(record.cost, record.currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-end font-bold tabular-nums',
                          record.profit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        {formatCurrency(record.profit, record.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        <Badge variant={m >= 0 ? 'default' : 'destructive'}>{m.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                if (
                                  confirm(t('financial.platform.platformRecords.deleteConfirm'))
                                ) {
                                  try {
                                    await apiClient.deletePlatformFinancialRecord(record.id);
                                    toast.success(
                                      t('financial.platform.platformRecords.deleteSuccess'),
                                    );
                                    loadData();
                                  } catch (err: unknown) {
                                    toast.error(
                                      apiErrorMessage(
                                        err,
                                        t('financial.platform.platformRecords.deleteError'),
                                      ),
                                    );
                                  }
                                }
                              }}
                            >
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="stores">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>{t('financial.platform.storeRecords.store')}</TableHead>
                <TableHead>{t('financial.platform.storeRecords.period')}</TableHead>
                <TableHead>{t('financial.platform.storeRecords.category')}</TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.storeRecords.revenue')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.storeRecords.cost')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.storeRecords.profit')}
                </TableHead>
                <TableHead className="text-end">
                  {t('financial.platform.storeRecords.margin')}
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t('financial.platform.storeRecords.noRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                storeRecords.map((record) => {
                  const m = profitMargin(record.revenue, record.cost);
                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-medium">
                        {record.store?.name ?? `Store #${record.academy_id}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(record.period_start).toLocaleDateString()} –{' '}
                        {new Date(record.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {record.costCategory ? (
                          <Badge variant="outline">{record.costCategory.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end font-medium tabular-nums">
                        {formatCurrency(record.revenue, record.currency)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums text-destructive">
                        {formatCurrency(record.cost, record.currency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-end font-bold tabular-nums',
                          record.profit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                        )}
                      >
                        {formatCurrency(record.profit, record.currency)}
                      </TableCell>
                      <TableCell className="text-end">
                        <Badge variant={m >= 0 ? 'default' : 'destructive'}>{m.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push('/platform/academies')}>
                              {t('financial.platform.storeRecords.view')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
