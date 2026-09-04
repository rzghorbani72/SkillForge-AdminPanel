'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { safePanelPath } from '@/lib/auth-routing';

function HandoffRedirect() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get('code')?.trim() ?? '';
    const next = safePanelPath(searchParams.get('next'), '/dashboard');

    if (!code) {
      router.replace('/login');
      return;
    }

    void (async () => {
      try {
        await apiClient.consumePanelHandoff(code);
        window.location.replace(next);
      } catch {
        router.replace('/login');
      }
    })();
  }, [router, searchParams]);

  return (
    <AuthStatusScreen
      title={t('success.loginSuccess')}
      message={t('auth.redirectingToDashboard')}
    />
  );
}

export default function PanelHandoffPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <AuthStatusScreen
          title={t('success.loginSuccess')}
          message={t('auth.redirectingToDashboard')}
        />
      }
    >
      <HandoffRedirect />
    </Suspense>
  );
}
