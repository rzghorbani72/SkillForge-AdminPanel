import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  buildTrustedBackendUrl,
  buildInternalBackendHeaders
} from '@/lib/security/ssrf';
import { paymentResultUrl } from '@/lib/payment-callback-url';

/**
 * Mellat BP POSTs the payment result here after the user completes (or cancels) payment.
 * Body fields: ResCode, RefId, SaleOrderId, SaleReferenceId
 *
 * Flow:
 *  1. Read Mellat POST body fields
 *  2. If ResCode !== '0' → redirect to /payment/callback with failure
 *  3. Call backend /payments/verify/mellat
 *  4. Redirect to /payment/callback with success/failure result
 */
export async function POST(request: NextRequest) {
  let resCode: string | null = null;
  let refId: string | null = null;
  let saleOrderId: string | null = null;
  let saleReferenceId: string | null = null;

  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      resCode = params.get('ResCode');
      refId = params.get('RefId');
      saleOrderId = params.get('SaleOrderId');
      saleReferenceId = params.get('SaleReferenceId');
    } else {
      try {
        const form = await request.formData();
        resCode = form.get('ResCode') as string | null;
        refId = form.get('RefId') as string | null;
        saleOrderId = form.get('SaleOrderId') as string | null;
        saleReferenceId = form.get('SaleReferenceId') as string | null;
      } catch {
        const json = (await request.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        resCode =
          typeof json.ResCode === 'string' || typeof json.ResCode === 'number'
            ? String(json.ResCode)
            : null;
        refId = typeof json.RefId === 'string' ? json.RefId : null;
        saleOrderId =
          typeof json.SaleOrderId === 'string' ||
          typeof json.SaleOrderId === 'number'
            ? String(json.SaleOrderId)
            : null;
        saleReferenceId =
          typeof json.SaleReferenceId === 'string' ||
          typeof json.SaleReferenceId === 'number'
            ? String(json.SaleReferenceId)
            : null;
      }
    }
  } catch {
    return NextResponse.redirect(
      paymentResultUrl({ success: 'false', error: 'invalid_callback' }),
      { status: 303 }
    );
  }

  if (resCode !== '0' || !saleOrderId || !saleReferenceId) {
    const reason = resCode === '17' ? 'cancelled' : 'payment_failed';
    return NextResponse.redirect(
      paymentResultUrl({
        success: 'false',
        error: reason,
        status: resCode ?? undefined
      }),
      { status: 303 }
    );
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    const academyId = cookieStore.get('academy_id')?.value;

    const verifyRes = await fetch(
      buildTrustedBackendUrl('/payments/verify/mellat'),
      {
        method: 'POST',
        headers: buildInternalBackendHeaders({
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(academyId && { 'X-Academy-ID': academyId })
        }),
        body: JSON.stringify({
          // Mellat SaleOrderId is not our cuid — backend resolves via RefId/authority.
          payment_id: saleOrderId,
          ResCode: resCode,
          RefId: refId ?? '',
          SaleOrderId: saleOrderId,
          SaleReferenceId: saleReferenceId
        })
      }
    );

    const data = (await verifyRes.json()) as {
      status?: string;
      data?: { payment_id?: string; reason?: string };
    };

    if (data.status === 'ok') {
      return NextResponse.redirect(
        paymentResultUrl({
          success: 'true',
          refid: saleReferenceId,
          clientrefid: data.data?.payment_id ?? saleOrderId
        }),
        { status: 303 }
      );
    }

    return NextResponse.redirect(
      paymentResultUrl({
        success: 'false',
        error: data.data?.reason ?? 'verification_failed'
      }),
      { status: 303 }
    );
  } catch {
    return NextResponse.redirect(
      paymentResultUrl({ success: 'false', error: 'server_error' }),
      { status: 303 }
    );
  }
}
