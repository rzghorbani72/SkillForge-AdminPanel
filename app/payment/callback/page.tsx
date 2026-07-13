'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Payment gateway result page for AdminPanel (platform plan renew).
 * Saman/Mellat callback routes verify with the backend, then redirect here with:
 *   ?success=true&refid=<gateway_ref>&clientrefid=<payment_id>
 * or:
 *   ?success=false&error=<reason>
 */
export default function AdminPaymentCallbackPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    refId?: string;
    error?: string;
  } | null>(null);

  const successParam = searchParams.get('success');
  const refId = searchParams.get('refid');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (successParam === 'true') {
      setResult({ success: true, refId: refId ?? undefined });
      setProcessing(false);
      return;
    }

    if (successParam === 'false' || errorParam) {
      setResult({
        success: false,
        error: errorParam || t('plans.payFailedDefault')
      });
      setProcessing(false);
      return;
    }

    // Legacy params without a success flag — treat as incomplete.
    setResult({ success: false, error: t('plans.payIncompleteParams') });
    setProcessing(false);
  }, [successParam, refId, errorParam, t]);

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">{t('plans.payVerifying')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('plans.payPleaseWait')}
          </p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">{t('plans.paySuccessTitle')}</h1>
          <p className="text-muted-foreground">{t('plans.paySuccessDesc')}</p>
          {result.refId && (
            <div className="rounded-lg border p-4 text-start font-mono text-sm">
              {t('plans.payTrackingCode')}: {result.refId}
            </div>
          )}
          <Button
            onClick={() => router.push('/plans?paid=1')}
            className="w-full"
          >
            {t('plans.payBackToPlans')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">{t('plans.payFailedTitle')}</h1>
        <p className="text-muted-foreground">
          {result?.error || t('plans.payFailedDesc')}
        </p>
        <Button onClick={() => router.push('/plans')} className="w-full">
          {t('plans.payBackToPlans')}
        </Button>
      </div>
    </div>
  );
}
