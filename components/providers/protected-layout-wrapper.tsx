'use client';

import { useEffect, useRef } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { PanelFooter } from '@/components/layout/panel-footer';
import { ThemeInitializer } from '@/components/providers/ThemeInitializer';
import { UserProvider } from '@/components/providers/user-provider';
import { StoreProvider } from '@/components/providers/store-provider';
import { LegalConsentGate } from '@/components/legal/legal-consent-gate';
import { SubscriptionRequiredGate } from '@/components/subscription/subscription-required-gate';
import { AcademyRequiredGate } from '@/components/academies/academy-required-gate';
import { ScopeContextBanner } from '@/components/shared/scope-context-banner';
import { useCategoriesStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n/provider';

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const hasFetchedCategories = useRef(false);
  const { direction } = useI18n();

  useEffect(() => {
    if (hasFetchedCategories.current) return;
    hasFetchedCategories.current = true;
    fetchCategories();
  }, [fetchCategories]);

  return (
    <StoreProvider>
      <ThemeInitializer />
      <SubscriptionRequiredGate />
      <div className="flex h-screen overflow-hidden" dir={direction}>
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <ScopeContextBanner />
          <div className="beautiful-scrollbar flex-1 overflow-auto overscroll-contain">
            <div className="mx-auto flex min-h-full w-full max-w-[1700px] flex-col">
              <div className="flex-1">
                <AcademyRequiredGate>{children}</AcademyRequiredGate>
              </div>
              <PanelFooter />
            </div>
          </div>
        </main>
      </div>
    </StoreProvider>
  );
}

export function ProtectedLayoutWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <LegalConsentGate>
        <ProtectedShell>{children}</ProtectedShell>
      </LegalConsentGate>
    </UserProvider>
  );
}
