import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  buildTrustedBackendUrl,
  buildInternalBackendHeaders
} from '@/lib/security/ssrf';
import { paymentResultUrl } from '@/lib/payment-callback-url';

/**
 * BitPay redirects the manager back here after payment with trans_id and
 * id_get in the query string (official BitPay.ir callback). payment_id is
 * optional: we also stored id_get as the payment authority at checkout.
 *
 * Verification happens server-side here, so the manager never sees a screen
 * that "confirms" a payment the backend has not verified.
 *
 * A cancelled or failed payment comes back with trans_id = -1 (or missing).
 */
const failure = (reason: string) =>
  NextResponse.redirect(paymentResultUrl({ success: 'false', error: reason }), {
    status: 303
  });

const handle = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);

  const params = new URLSearchParams(requestUrl.search);
  if (request.method === 'POST') {
    try {
      const form = await request.formData();
      form.forEach((value, key) => params.set(key, String(value)));
    } catch {
      // A callback we cannot read is reported as invalid, never as paid.
    }
  }

  const transId = params.get('trans_id');
  const idGet = params.get('id_get');
  const paymentId = params.get('payment_id') ?? '';

  if (!transId || transId === '-1' || !idGet) {
    return failure(transId === '-1' ? 'cancelled' : 'invalid_callback');
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    const academyId = cookieStore.get('academy_id')?.value;

    const verifyRes = await fetch(
      buildTrustedBackendUrl('/payments/verify/bitpay'),
      {
        method: 'POST',
        headers: buildInternalBackendHeaders({
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(academyId && { 'X-Academy-ID': academyId })
        }),
        body: JSON.stringify({
          payment_id: paymentId,
          trans_id: transId,
          id_get: idGet
        })
      }
    );

    const data = (await verifyRes.json()) as {
      status?: string;
      data?: { payment_id?: string; reason?: string };
    };

    if (data.status !== 'ok') {
      return failure(data.data?.reason ?? 'verification_failed');
    }

    return NextResponse.redirect(
      paymentResultUrl({
        success: 'true',
        refid: transId,
        clientrefid: data.data?.payment_id ?? paymentId
      }),
      { status: 303 }
    );
  } catch {
    return failure('server_error');
  }
};

export const GET = handle;
export const POST = handle;
