import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildTrustedBackendUrl } from '@/lib/security/ssrf';

/**
 * Saman SEP POSTs the payment result here after the user completes (or cancels) payment.
 * Body fields: State, Status, RefNum, ResNum (=our payment_id), TraceNo, MID, Amount, SecurePan, RRN
 *
 * Flow:
 *  1. Read State and RefNum from SEP POST body
 *  2. If State !== 'OK' → redirect to /payment/callback with failure info
 *  3. Call backend /payments/verify/saman
 *  4. Redirect to /payment/callback with success/failure result
 */
export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;

  let state: string | null = null;
  let refNum: string | null = null;
  let resNum: string | null = null;
  let statusCode: string | null = null;

  try {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      state = params.get('State');
      refNum = params.get('RefNum');
      resNum = params.get('ResNum');
      statusCode = params.get('Status');
    } else {
      try {
        const form = await request.formData();
        state = form.get('State') as string | null;
        refNum = form.get('RefNum') as string | null;
        resNum = form.get('ResNum') as string | null;
        statusCode = form.get('Status') as string | null;
      } catch {
        const json = await request.json().catch(() => ({}));
        state = json.State ?? null;
        refNum = json.RefNum ?? null;
        resNum = json.ResNum ?? null;
        statusCode = json.Status ?? null;
      }
    }
  } catch {
    return NextResponse.redirect(
      `${origin}/payment/callback?success=false&error=invalid_callback`,
      {
        status: 303
      }
    );
  }

  if (state !== 'OK' || !refNum || !resNum) {
    const reason = state === 'CanceledByUser' ? 'cancelled' : 'payment_failed';
    const url = new URL(`${origin}/payment/callback`);
    url.searchParams.set('success', 'false');
    url.searchParams.set('error', reason);
    if (statusCode) url.searchParams.set('status', statusCode);
    return NextResponse.redirect(url.toString(), { status: 303 });
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    const academyId = cookieStore.get('academy_id')?.value;

    const verifyRes = await fetch(
      buildTrustedBackendUrl('/payments/verify/saman'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(academyId && { 'X-Academy-ID': academyId })
        },
        body: JSON.stringify({ payment_id: resNum, ref_num: refNum })
      }
    );

    const data = (await verifyRes.json()) as {
      status?: string;
      data?: { payment_id?: string; reason?: string };
    };

    if (data.status === 'ok') {
      // Reuse the existing /payment/callback page (it reads refid and clientrefid)
      const url = new URL(`${origin}/payment/callback`);
      url.searchParams.set('refid', refNum);
      url.searchParams.set('clientrefid', data.data?.payment_id ?? resNum);
      return NextResponse.redirect(url.toString(), { status: 303 });
    }

    const url = new URL(`${origin}/payment/callback`);
    url.searchParams.set('success', 'false');
    url.searchParams.set('error', data.data?.reason ?? 'verification_failed');
    return NextResponse.redirect(url.toString(), { status: 303 });
  } catch {
    return NextResponse.redirect(
      `${origin}/payment/callback?success=false&error=server_error`,
      { status: 303 }
    );
  }
}
