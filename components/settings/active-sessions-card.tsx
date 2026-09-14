'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Laptop, MonitorSmartphone } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { ActiveSession } from '@/types/api';

type PendingAction = { kind: 'one'; session: ActiveSession } | { kind: 'others' } | null;

export function ActiveSessionsCard() {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setSessions(await apiClient.getActiveSessions());
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirm = async () => {
    if (!pending) return;
    try {
      setIsWorking(true);
      if (pending.kind === 'one') {
        await apiClient.revokeSession(pending.session.id);
        ErrorHandler.showSuccess(t('settings.sessionTerminated'));
      } else {
        await apiClient.logoutOtherDevices();
        ErrorHandler.showSuccess(t('settings.otherSessionsTerminated'));
      }
      await load();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsWorking(false);
      setPending(null);
    }
  };

  const otherCount = sessions.filter((s) => !s.is_current).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5" /> {t('settings.activeSessions')}
          </CardTitle>
          <CardDescription>{t('settings.activeSessionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('settings.noActiveSessions')}</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Laptop className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {session.device_info}
                      {session.is_current && (
                        <Badge variant="secondary">{t('settings.thisDevice')}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.ip_address} ·{' '}
                      {t('settings.sessionLastActive', {
                        date: formatDate(session.last_used_at, {
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      })}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isWorking}
                    onClick={() => setPending({ kind: 'one', session })}
                  >
                    {t('settings.terminateSession')}
                  </Button>
                )}
              </div>
            ))
          )}

          {otherCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isWorking}
              onClick={() => setPending({ kind: 'others' })}
            >
              {t('settings.terminateOtherSessions')}
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={pending !== null}
        title={
          pending?.kind === 'others'
            ? t('settings.terminateOtherSessions')
            : t('settings.terminateSession')
        }
        description={
          pending?.kind === 'others'
            ? t('settings.terminateOtherSessionsConfirm', {
                count: otherCount,
              })
            : t('settings.terminateSessionConfirm', {
                device: pending?.kind === 'one' ? pending.session.device_info : '',
              })
        }
        confirmLabel={t('settings.terminateSession')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
