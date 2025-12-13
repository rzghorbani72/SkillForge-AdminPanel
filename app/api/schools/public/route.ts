import { NextRequest, NextResponse } from 'next/server';
import { proxyApiRequest } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
  // Use proxy utility which handles 401/403 redirects automatically
  return proxyApiRequest(request, '/api/stores/public', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
