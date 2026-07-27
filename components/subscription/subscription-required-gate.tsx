'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import {
  apiClient,
  SUBSCRIPTION_REQUIRED_EVENT,
  type SubscriptionRequiredDetail
} from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

export function SubscriptionRequiredGate() {
  const { t } = useTranslation();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onRequired = (event: Event) => {
      const detail = (event as CustomEvent<SubscriptionRequiredDetail>).detail;
      setMessage(detail?.message ?? t('subscription.expiredWarning'));
    };
    window.addEventListener(SUBSCRIPTION_REQUIRED_EVENT, onRequired);
    return () =>
      window.removeEventListener(SUBSCRIPTION_REQUIRED_EVENT, onRequired);
  }, [t]);

  function dismiss() {
    setMessage(null);
    apiClient.clearSubscriptionRequired();
  }

  function goToPlans() {
    apiClient.clearSubscriptionRequired();
    setMessage(null);
    router.push('/plans');
  }

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="subscription-required-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h2 id="subscription-required-title" className="text-lg font-bold">
            {t('subscription.expiredTitle')}
          </h2>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={goToPlans}>
            {t('subscription.upgradeCta')}
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={dismiss}
          >
            {t('subscription.continueViewing')}
          </button>
        </div>
      </div>
    </div>
  );
}
