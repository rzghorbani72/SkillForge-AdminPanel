'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticking, setTicking] = useState(false);
  const [tickResult, setTickResult] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getAcademyPlans();
      setPlans(Array.isArray(data) ? data : (data?.plans ?? []));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runLifecycleTick() {
    setTicking(true);
    setTickResult(null);
    try {
      const result = await apiClient.triggerSubscriptionLifecycle();
      setTickResult(result);
      toast.success(t('common.success'));
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setTicking(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('subscriptions.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('subscriptions.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptions.lifecycleEngine')}</CardTitle>
          <CardDescription>{t('subscriptions.lifecycleDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runLifecycleTick} disabled={ticking}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${ticking ? 'animate-spin' : ''}`}
            />
            {ticking ? t('subscriptions.running') : t('subscriptions.runTick')}
          </Button>

          {tickResult && (
            <div className="space-y-2 rounded-md border bg-muted/50 p-4">
              <p className="text-sm font-semibold">
                {t('subscriptions.tickResult')}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {tickResult.expired !== undefined && (
                  <Badge variant="outline">
                    {t('subscriptions.expired')}: {tickResult.expired}
                  </Badge>
                )}
                {tickResult.renewalsPending !== undefined && (
                  <Badge variant="outline">
                    {t('subscriptions.renewalsPending')}:{' '}
                    {tickResult.renewalsPending}
                  </Badge>
                )}
                {tickResult.reminders !== undefined && (
                  <Badge variant="outline">
                    {t('subscriptions.reminders')}: {tickResult.reminders}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptions.academyPlans')}</CardTitle>
          <CardDescription>{t('subscriptions.allPlans')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarClock className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('subscriptions.noPlans')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('subscriptions.plan')}</TableHead>
                  <TableHead>{t('subscriptions.academy')}</TableHead>
                  <TableHead>{t('subscriptions.kind')}</TableHead>
                  <TableHead>{t('subscriptions.price')}</TableHead>
                  <TableHead>{t('subscriptions.duration')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('subscriptions.expires')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name ?? plan.plan_name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {plan.academy?.name ?? plan.academy_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plan.kind ?? plan.type ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.price?.toLocaleString() ?? '—'}</TableCell>
                    <TableCell>
                      {plan.duration_days ? `${plan.duration_days}d` : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={plan.is_active ? 'active' : 'inactive'}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {plan.expires_at
                        ? new Date(plan.expires_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
