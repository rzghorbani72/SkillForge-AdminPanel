import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/toaster';
import '@uploadthing/react/styles.css';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next Shadcn',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('jwt');

  let decodedToken = null;
  if (token) {
    try {
      decodedToken = jwt.decode(token.value, { complete: true });
      if (decodedToken && 'payload' in decodedToken) {
        const payload = decodedToken.payload;
        if (payload) {
          decodedToken = {
            userId: payload.userId,
            phone: payload.phone,
            email: payload.email,
            role: payload.roles[0]
          };
        }
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${inter.className} overflow-hidden`}
        suppressHydrationWarning={true}
      >
        <NextTopLoader showSpinner={false} />
        <Toaster />
        <AuthProvider value={decodedToken}>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
