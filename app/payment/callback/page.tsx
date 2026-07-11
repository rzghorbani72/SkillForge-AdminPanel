'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Payment gateway result page for AdminPanel (platform plan renew).
 * Saman/Mellat callback routes verify with the backend, then redirect here with:
 *   ?success=true&refid=<gateway_ref>&clientrefid=<payment_id>
 * or:
 *   ?success=false&error=<reason>
 */
export default function AdminPaymentCallbackPage() {
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
      setResult({
        success: true,
        refId: refId ?? undefined
      });
      setProcessing(false);
      return;
    }

    if (successParam === 'false' || errorParam) {
      setResult({
        success: false,
        error: errorParam || 'پرداخت ناموفق بود'
      });
      setProcessing(false);
      return;
    }

    // Legacy PayPing-style params without success flag — treat as incomplete.
    setResult({
      success: false,
      error: 'پارامترهای بازگشت از بانک ناقص است'
    });
    setProcessing(false);
  }, [successParam, refId, errorParam]);

  if (processing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-sky-600" />
          <h2 className="text-xl font-semibold">در حال تأیید پرداخت...</h2>
          <p className="text-sm text-muted-foreground">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">پرداخت موفق</h1>
          <p className="text-muted-foreground">پلن شما با موفقیت فعال شد.</p>
          {result.refId && (
            <div className="rounded-lg border p-4 text-left font-mono text-sm">
              کد پیگیری: {result.refId}
            </div>
          )}
          <Button onClick={() => router.push('/plans')} className="w-full">
            بازگشت به پلن‌ها
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold">پرداخت ناموفق</h1>
        <p className="text-muted-foreground">
          {result?.error || 'خطایی در پردازش پرداخت رخ داد'}
        </p>
        <Button onClick={() => router.push('/plans')} className="w-full">
          بازگشت به پلن‌ها
        </Button>
      </div>
    </div>
  );
}
