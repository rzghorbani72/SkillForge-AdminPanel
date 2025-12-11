'use client';

import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';
import { UserProvider } from '@/components/providers/user-provider';

export function ProtectedLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
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
    </UserProvider>
  );
}
