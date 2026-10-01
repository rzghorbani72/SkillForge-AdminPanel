'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { type PlatformSettingsData } from '@/lib/api';
import { formatIRR, toPercent } from '@/components/platform/pricing/pricing-helpers';
import { asNumber } from '../_lib/page-helpers';

export function PlatformSummaryCard({ settings }: { settings: PlatformSettingsData }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pricing.platform.summaryTitle')}</CardTitle>
        <CardDescription>{t('pricing.platform.summaryDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryVat')}</dt>
            <dd className="font-semibold">{toPercent(asNumber(settings.vat_rate))}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryTeacherShare')}</dt>
            <dd className="font-semibold">{toPercent(asNumber(settings.teacher_share_rate))}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryGrace')}</dt>
            <dd className="font-semibold">
              {settings.subscription_grace_days} {t('pricing.platform.days')}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryReminder')}</dt>
            <dd className="font-semibold">
              {settings.subscription_reminder_days} {t('pricing.platform.daysBefore')}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryOverage')}</dt>
            <dd className="font-semibold">
              {formatIRR(asNumber(settings.storage_overage_fee_irr))}/GB
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('pricing.platform.summaryPhase')}</dt>
            <dd className="text-xs font-semibold">{settings.payment_release_phase}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
