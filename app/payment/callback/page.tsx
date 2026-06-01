'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

/**
 * Payment gateway callback page for AdminPanel.
 * PayPing / Simulator redirects here with:
 *   ?refid=<gateway_ref>&clientrefid=<payment_id>
 *
 * After verifying, shows success/failure and redirects to plans page.
 */
export default function AdminPaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    refId?: string;
    amount?: number;
    error?: string;
  } | null>(null);

  const refId = searchParams.get('refid');
  const clientRefId = searchParams.get('clientrefid');

  useEffect(() => {
    const verify = async () => {
      if (!refId || !clientRefId) {
        setResult({
          success: false,
          error: 'پارامترهای بازگشت از بانک ناقص است'
        });
        setProcessing(false);
        return;
      }

      const paymentId = clientRefId;

      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId, ref_id: refId })
        });
        const data = await res.json();

        if (data.success || data.already_paid) {
          setResult({
            success: true,
            refId: data.ref_id || refId,
            amount: data.amount
          });
        } else {
          setResult({
            success: false,
            error: data.error || 'تأیید پرداخت ناموفق بود'
          });
        }
      } catch {
        setResult({
          success: false,
          error: 'خطا در بررسی پرداخت. لطفاً با پشتیبانی تماس بگیرید.'
        });
      } finally {
        setProcessing(false);
      }
    };

    verify();
  }, [refId, clientRefId]);

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
