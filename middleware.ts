// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('jwt')?.value;

  if (!token && !req.nextUrl.pathname.includes('login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token) {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      //EXPIRED
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (req.nextUrl.pathname.includes('login')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  // decoded {
  //    expires: '2024-10-20T09:47:26Z',
  //    userId: 1,
  //    email: 'viola@prisma.io',
  //    phone: '+989214432309',
  //    iat: 1729417406,
  //    exp: 1729421006
  // }

  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/login'] };
