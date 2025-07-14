import { authService } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest): Promise<NextResponse> =>
  await authService.handleGet(request);

export const POST = async (request: NextRequest): Promise<NextResponse> =>
  await authService.handlePost(request);
