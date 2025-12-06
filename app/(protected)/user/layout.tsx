import type { Metadata } from 'next';
import Sidebar from '@/components/layout/sidebar-old';
import Header from '@/components/layout/header';
import { isAuth } from '@/lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const metadata: Metadata = {
  title: 'User',
  description: 'User'
};

export default async function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }
  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
}
