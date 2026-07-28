import { cookies } from 'next/headers';
import { isAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ProtectedLayoutWrapper } from '@/components/providers/protected-layout-wrapper';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }

  return <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>;
}
