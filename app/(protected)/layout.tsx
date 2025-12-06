import { cookies } from 'next/headers';
import { isAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { CategoriesInitializer } from '@/components/providers/CategoriesInitializer';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }

  return (
    <>
      {/* <CategoriesInitializer /> */}
      <ThemeInitializer />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Subtle background pattern */}
          <div className="gradient-mesh pointer-events-none absolute inset-0 -z-10 opacity-50" />

          <Header />
          <div className="beautiful-scrollbar flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
