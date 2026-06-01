import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/api-base-url';
import { cookies } from 'next/headers';

const BACKEND_URL = getServerApiBaseUrl();

/**
 * POST /api/payment/verify
 * Called by /payment/callback after gateway redirect.
 * Forwards to backend /payments/verify/payping (handles both PAYPING and SIMULATOR providers).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, ref_id } = body;

    if (!payment_id) {
      return NextResponse.json(
        { success: false, error: 'payment_id is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    const academyId = cookieStore.get('academy_id')?.value;

    const backendRes = await fetch(
      `${BACKEND_URL}/api/payments/verify/payping`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(academyId && { 'X-Academy-ID': academyId })
        },
        body: JSON.stringify({ payment_id, ref_id: ref_id || '' })
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Verification failed' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({
      success: data.status === 'ok',
      payment_id: data.data?.payment_id,
      ref_id: data.data?.ref_id,
      amount: data.data?.amount,
      already_paid: data.data?.already_paid,
      error: data.status !== 'ok' ? data.data?.reason : undefined
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
