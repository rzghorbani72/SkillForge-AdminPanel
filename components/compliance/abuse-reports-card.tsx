'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate } from '@/lib/utils';
import { ABUSE_STATUS, type AbuseReport } from '@/types/compliance';

/**
 * Open abuse reports, soonest deadline first. The overdue count is shown even
 * when zero-state is empty: the policy commits to 72 business hours, so the
 * number that matters is how many we have already missed.
 */
export function AbuseReportsCard() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AbuseReport[]>([]);
  const [overdue, setOverdue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAbuseReports();
      setItems(data.items);
      setOverdue(data.overdue);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (report: AbuseReport, actioned: boolean) => {
    const note = actioned
      ? undefined
      : (window.prompt(t('compliance.abuse.dismissReason')) ?? '');
    if (!actioned && !note?.trim()) return;

    setBusy(report.id);
    try {
      await apiClient.resolveAbuseReport(report.id, {
        status: actioned ? ABUSE_STATUS.ACTIONED : ABUSE_STATUS.DISMISSED,
        note: note || undefined
      });
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('compliance.abuse.title')}
        </CardTitle>
        <CardDescription>{t('compliance.abuse.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdue > 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('compliance.abuse.overdue', { count: overdue })}
            </AlertDescription>
          </Alert>
        ) : null}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('compliance.abuse.empty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((report) => (
              <li key={report.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={report.reported_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {report.reported_url}
                  </a>
                  <Badge variant={report.overdue ? 'destructive' : 'secondary'}>
                    {report.overdue
                      ? t('compliance.abuse.pastDue')
                      : t('compliance.abuse.dueBy', {
                          date: formatDate(report.due_at)
                        })}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{report.reason}</p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {report.reporter_email ?? t('compliance.abuse.anonymous')}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === report.id}
                      onClick={() => decide(report, false)}
                    >
                      {t('compliance.abuse.dismiss')}
                    </Button>
                    <Button
                      size="sm"
                      disabled={busy === report.id}
                      onClick={() => decide(report, true)}
                    >
                      {t('compliance.abuse.actioned')}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
