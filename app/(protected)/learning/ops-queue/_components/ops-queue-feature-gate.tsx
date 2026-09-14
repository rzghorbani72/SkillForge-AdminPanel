'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OpsQueueFeatureGateProps {
  checkingFeature: boolean;
  featureEnabled: boolean | null;
  isManager: boolean;
  enablingFeature: boolean;
  onEnable: () => void;
}

export function OpsQueueFeatureGate({
  checkingFeature,
  featureEnabled,
  isManager,
  enablingFeature,
  onEnable,
}: OpsQueueFeatureGateProps) {
  const { t } = useTranslation();

  if (checkingFeature) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (featureEnabled !== false) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t('opsQueue.featureDisabled')}
        </CardTitle>
        <CardDescription>{t('opsQueue.featureDisabledDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {isManager ? (
          <>
            <Button onClick={() => void onEnable()} disabled={enablingFeature}>
              {enablingFeature ? t('opsQueue.enablingFeature') : t('opsQueue.enableFeature')}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings/academy">{t('settings.storeSettings')}</Link>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t('opsQueue.contactManager')}</p>
        )}
      </CardContent>
    </Card>
  );
}
