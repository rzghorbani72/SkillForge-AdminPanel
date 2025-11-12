import { cookies } from 'next/headers';
import { isAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { CategoriesInitializer } from '@/components/providers/CategoriesInitializer';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }

  return (
    <>
      {/* <CategoriesInitializer /> */}
      <ThemeInitializer />
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </>
  );
}
