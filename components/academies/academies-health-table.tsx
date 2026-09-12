'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { apiClient, AcademyHealthView } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { getPlanDisplayName } from '@/lib/plan-display-name';
import { cn } from '@/lib/utils';
import { CopyableId } from './copyable-id';
import { AcademySettlementSheet } from './academy-settlement-sheet';
import {
  SettlementSignalCell,
  TicketSignalCell
} from './academy-health-signals';

type AttentionFilter = 'all' | 'settle' | 'tickets';

function storagePercent(
  academy: AcademyHealthView,
  formatPercent: (value: number) => string
): string {
  const storage = academy.limits?.storage_gb;
  if (!storage || storage.limit <= 0) return '—';
  return formatPercent((storage.used / storage.limit) * 100);
}

function needsSettle(academy: AcademyHealthView): boolean {
  return (
    (academy.to_deposit ?? 0) > 0 || (academy.pending_withdrawal_count ?? 0) > 0
  );
}

function hasOpenTickets(academy: AcademyHealthView): boolean {
  return (academy.open_ticket_count ?? 0) > 0;
}

function attentionScore(academy: AcademyHealthView): number {
  const deposit = academy.to_deposit ?? 0;
  const pending = academy.pending_withdrawal_count ?? 0;
  const tickets = academy.open_ticket_count ?? 0;
  return (deposit > 0 ? 1000 + deposit : 0) + pending * 100 + tickets;
}

export function AcademiesHealthTable() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const formatPercent = usePercentLabel();
  const [rows, setRows] = useState<AcademyHealthView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AttentionFilter>('all');
  const [selected, setSelected] = useState<AcademyHealthView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getPlatformAcademiesHealth();
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      settle: rows.filter(needsSettle).length,
      tickets: rows.filter(hasOpenTickets).length
    }),
    [rows]
  );

  const sorted = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (filter === 'settle') return needsSettle(row);
      if (filter === 'tickets') return hasOpenTickets(row);
      return true;
    });
    return [...filtered].sort((a, b) => attentionScore(b) - attentionScore(a));
  }, [rows, filter]);

  function openSettle(academy: AcademyHealthView) {
    setSelected(academy);
    setSheetOpen(true);
  }

  const settlementLabels = {
    wallet: t('academiesHealth.settle.wallet'),
    toDeposit: t('academiesHealth.toDeposit'),
    pending: t('academiesHealth.settle.pending'),
    requests: t('academiesHealth.pendingRequests'),
    clear: t('academiesHealth.settleClear'),
    bankMissing: t('academiesHealth.settle.bankMissing')
  };

  const ticketLabels = {
    open: t('academiesHealth.openTickets'),
    closed: t('academiesHealth.closedTickets')
  };

  return (
    <>
      <Card>
        <CardHeader className="gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('academiesHealth.title')}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', t('academiesHealth.filterAll'), rows.length],
                ['settle', t('academiesHealth.filterSettle'), counts.settle],
                ['tickets', t('academiesHealth.filterTickets'), counts.tickets]
              ] as const
            ).map(([key, label, count]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className="ms-1.5 tabular-nums opacity-80">
                  {formatNumber(count)}
                </span>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              {t('support.loading')}
            </p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('academiesHealth.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('academiesHealth.row')}</TableHead>
                    <TableHead>{t('academiesHealth.name')}</TableHead>
                    <TableHead>{t('academiesHealth.manager')}</TableHead>
                    <TableHead>{t('academiesHealth.created')}</TableHead>
                    <TableHead>{t('academiesHealth.plan')}</TableHead>
                    <TableHead>{t('academiesHealth.settlementCol')}</TableHead>
                    <TableHead>{t('academiesHealth.ticketsCol')}</TableHead>
                    <TableHead>{t('academiesHealth.storage')}</TableHead>
                    <TableHead>{t('academiesHealth.expiry')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((academy, index) => {
                    const hot = needsSettle(academy) || hasOpenTickets(academy);
                    return (
                      <TableRow
                        key={academy.id}
                        className={cn('cursor-pointer', hot && 'bg-muted/40')}
                        onClick={() => openSettle(academy)}
                        title={t('academiesHealth.clickToSettle')}
                      >
                        <TableCell className="align-top tabular-nums">
                          {formatNumber(index + 1)}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <p className="flex flex-wrap items-center gap-1.5 font-medium leading-tight">
                              {academy.name}
                              {academy.kyc_verified ? (
                                <Badge
                                  variant="outline"
                                  title={t('academiesHealth.kycVerifiedTitle')}
                                  className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                >
                                  <ShieldCheck className="size-3" />
                                  {t('academiesHealth.kycVerified')}
                                </Badge>
                              ) : null}
                            </p>
                            <div onClick={(e) => e.stopPropagation()}>
                              <CopyableId
                                value={academy.id}
                                className="max-w-[160px] text-xs"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm">
                          {academy.manager_name ?? '—'}
                        </TableCell>
                        <TableCell className="align-top text-sm">
                          {academy.created_at
                            ? formatDate(academy.created_at)
                            : '—'}
                        </TableCell>
                        <TableCell className="align-top text-sm">
                          {getPlanDisplayName(academy.plan_slug) ?? '—'}
                        </TableCell>
                        <TableCell className="align-top">
                          <SettlementSignalCell
                            academy={academy}
                            formatNumber={formatNumber}
                            tomanLabel={t('common.toman')}
                            labels={settlementLabels}
                          />
                        </TableCell>
                        <TableCell className="align-top">
                          <TicketSignalCell
                            academy={academy}
                            formatNumber={formatNumber}
                            labels={ticketLabels}
                          />
                        </TableCell>
                        <TableCell className="align-top text-sm tabular-nums">
                          {storagePercent(academy, formatPercent)}
                        </TableCell>
                        <TableCell className="align-top text-sm">
                          {academy.expires_at
                            ? formatDate(academy.expires_at, {
                                month: 'numeric'
                              })
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AcademySettlementSheet
        academy={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSettled={() => {
          void load();
        }}
      />
    </>
  );
}
