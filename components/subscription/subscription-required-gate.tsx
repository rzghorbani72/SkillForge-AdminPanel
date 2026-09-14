'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { apiClient, SUBSCRIPTION_REQUIRED_EVENT, type SubscriptionRequiredDetail } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    return () => window.removeEventListener(SUBSCRIPTION_REQUIRED_EVENT, onRequired);
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

  return (
    <AlertDialog
      open={!!message}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader className="flex-row items-center gap-3 space-y-0 text-left sm:text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <AlertDialogTitle className="text-lg font-bold">
            {t('subscription.expiredTitle')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription className="mt-4">{message}</AlertDialogDescription>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:justify-start sm:space-x-0">
          <AlertDialogAction onClick={goToPlans} className="w-full">
            {t('subscription.upgradeCta')}
          </AlertDialogAction>
          <AlertDialogCancel className="mt-0 w-full border-0 bg-transparent p-0 text-sm font-normal text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground sm:mt-0">
            {t('subscription.continueViewing')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
