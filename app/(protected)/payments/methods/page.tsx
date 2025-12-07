'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Globe, Lock, Plus } from 'lucide-react';
import { usePaymentsData } from '../_hooks/use-payments-data';
import { Progress } from '@/components/ui/progress';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

const METHOD_CONFIG = [
  {
    key: 'CREDIT_CARD',
    title: 'Credit & Debit Cards',
    description: 'Accept payments from all major card networks via Stripe.',
    icon: CreditCard,
    badges: [
      { label: 'Stripe', tone: 'active' },
      { label: 'Apple Pay', tone: 'beta' }
    ]
  },
  {
    key: 'BANK_TRANSFER',
    title: 'Bank Transfer',
    description:
      'Support direct ACH and wire payments for enterprise customers.',
    icon: DollarSign,
    badges: [{ label: 'Manual', tone: 'pending' }]
  },
  {
    key: 'DIGITAL_WALLET',
    title: 'Digital Wallets',
    description: 'Let students pay with PayPal, Google Pay, or local wallets.',
    icon: Globe,
    badges: [
      { label: 'PayPal', tone: 'inactive' },
      { label: 'Google Pay', tone: 'roadmap' }
    ]
  }
] as const;

type Tone = 'active' | 'inactive' | 'pending' | 'beta' | 'roadmap';

const TONE_STYLES: Record<Tone, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  beta: 'bg-blue-100 text-blue-800',
  roadmap: 'bg-purple-100 text-purple-800'
};

export default function PaymentMethodsPage() {
  const { t, language } = useTranslation();
  const { payments } = usePaymentsData();
  const store = useCurrentStore();

  const methodMetrics = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();

    payments.forEach((payment) => {
      const method = payment.method ?? 'UNKNOWN';
      if (!map.has(method)) {
        map.set(method, { count: 0, total: 0 });
      }
      const bucket = map.get(method)!;
      bucket.count += 1;
      bucket.total += payment.amount ?? 0;
    });

    const totalRevenue = Array.from(map.values()).reduce(
      (sum, item) => sum + item.total,
      0
    );

    return {
      totalRevenue,
      breakdown: Array.from(map.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total,
        share:
          totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0
      }))
    };
  }, [payments]);

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('payments.paymentMethodsTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('payments.paymentMethodsPageDescription')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalRevenue')}
            </CardTitle>
            <CardDescription>
              {t('payments.capturedThroughGateways')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrencyWithStore(methodMetrics.totalRevenue, store)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.activeMethods')}
            </CardTitle>
            <CardDescription>
              {t('payments.activeMethodsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                METHOD_CONFIG.filter((item) =>
                  item.badges.some((badge) => badge.tone === 'active')
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('payments.inPipeline')}
            </CardTitle>
            <CardDescription>
              {t('payments.inPipelineDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                METHOD_CONFIG.filter((item) =>
                  item.badges.some(
                    (badge) => badge.tone === 'roadmap' || badge.tone === 'beta'
                  )
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.gatewayPerformance')}</CardTitle>
          <CardDescription>
            {t('payments.gatewayPerformanceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {methodMetrics.breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('payments.noPaymentsProcessed')}
            </p>
          ) : (
            methodMetrics.breakdown.map((item) => (
              <div
                key={item.method}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize">
                    {item.method.replace('_', ' ').toLowerCase()}
                  </p>
                  <Badge variant="outline">{item.count} payments</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{formatCurrencyWithStore(item.total, store)}</span>
                  <span className="text-muted-foreground">
                    {item.share}% of revenue
                  </span>
                </div>
                <Progress value={item.share} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {METHOD_CONFIG.map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5" />
                  {method.title}
                </CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {method.badges.map((badge) => (
                    <Badge
                      key={badge.label}
                      className={TONE_STYLES[badge.tone]}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Lock className="me-2 h-4 w-4" />{' '}
                    {t('payments.manageAccess')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="me-2 h-4 w-4" /> {t('payments.configure')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
