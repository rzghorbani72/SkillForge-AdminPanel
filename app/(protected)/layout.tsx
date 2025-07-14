import { cookies } from 'next/headers';
import { isAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }
  return <>{children}</>;
}
