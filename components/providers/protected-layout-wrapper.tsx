'use client';

import { useEffect, useRef } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';
import { UserProvider } from '@/components/providers/user-provider';
import { useCategoriesStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n/provider';

export function ProtectedLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const hasFetchedCategories = useRef(false);
  const { direction } = useI18n();

  useEffect(() => {
    if (hasFetchedCategories.current) return;
    hasFetchedCategories.current = true;
    fetchCategories();
  }, [fetchCategories]);

  return (
    <UserProvider>
      <ThemeInitializer />
      <div className="flex h-screen overflow-hidden" dir={direction}>
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <div className="beautiful-scrollbar flex-1 overflow-auto overscroll-contain">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
