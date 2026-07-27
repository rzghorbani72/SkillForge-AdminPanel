'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Loader2 } from 'lucide-react';
import {
  apiClient,
  LEGAL_CONSENT_REQUIRED_EVENT,
  type LegalConsentRequiredDetail
} from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

type PendingLegalDocument = {
  type: string;
  title: string;
  version: string;
};

function isPendingList(value: unknown): value is PendingLegalDocument[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as PendingLegalDocument).type === 'string' &&
        typeof (item as PendingLegalDocument).title === 'string' &&
        typeof (item as PendingLegalDocument).version === 'string'
    )
  );
}

export function LegalConsentGate({ children }: { children: React.ReactNode }) {
  const { t, language } = useTranslation();
  const { user, isLoading: userLoading } = useAuthUser();
  const [pending, setPending] = useState<PendingLegalDocument[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPending = useCallback((list: PendingLegalDocument[]) => {
    setPending(list);
    if (list.length > 0) {
      apiClient.pauseForLegalConsent(list);
    } else if (apiClient.getPauseReason() === 'legal') {
      apiClient.resumeRequests();
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await apiClient.getLegalAcceptanceStatus(language);
      const list = isPendingList(res.data?.pending) ? res.data.pending : [];
      applyPending(list);
      setError(null);
    } catch {
      // Do not clear an existing legal pause if status fails mid-gate
      if (apiClient.getPauseReason() !== 'legal') {
        setPending([]);
      }
    }
  }, [applyPending, language]);

  const isPlatformAdmin = !!user?.isAdminProfile || !!user?.platformLevel;

  useEffect(() => {
    if (userLoading || !user || isPlatformAdmin) return;
    void loadStatus();
  }, [loadStatus, user, userLoading, isPlatformAdmin]);

  // First LEGAL_CONSENT_REQUIRED 403 from any API opens the modal and pauses fetches
  useEffect(() => {
    if (isPlatformAdmin) return;
    const onLegalRequired = (event: Event) => {
      const detail = (event as CustomEvent<LegalConsentRequiredDetail>).detail;
      const list = isPendingList(detail?.pending) ? detail.pending : [];
      if (list.length > 0) {
        setPending(list);
        return;
      }
      void loadStatus();
    };

    window.addEventListener(LEGAL_CONSENT_REQUIRED_EVENT, onLegalRequired);
    return () => {
      window.removeEventListener(LEGAL_CONSENT_REQUIRED_EVENT, onLegalRequired);
    };
  }, [loadStatus, isPlatformAdmin]);

  async function handleAccept() {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.acceptPlatformLegalDocuments(language);
      apiClient.resumeRequests();
      // Remount providers/pages that never loaded under the consent gate
      window.location.reload();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  // Platform AdminProfile is not Profile-scoped; never block the panel on legal gate.
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Wait for auth + consent before mounting the shell (avoids parallel API storms)
  if (userLoading || (user && pending === null)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || pending === null || pending.length === 0) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-consent-title"
    >
      <div className="auth-card w-full max-w-lg rounded-2xl p-6 shadow-xl">
        <h2 id="legal-consent-title" className="text-xl font-bold">
          {t('legal.reacceptTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('legal.reacceptDescriptionBefore')
            ? `${t('legal.reacceptDescriptionBefore')} `
            : null}
          <Link href="/terms" className="underline hover:text-foreground">
            {t('auth.termsOfService')}
          </Link>{' '}
          {t('legal.reacceptDescriptionMiddle')}{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t('auth.privacyPolicy')}
          </Link>{' '}
          {t('legal.reacceptDescriptionAfter')}
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          {pending.map((doc) => (
            <li
              key={doc.type}
              className="rounded-lg border border-border px-3 py-2"
            >
              <span className="font-medium">{doc.title}</span>
              <span className="ms-2 text-muted-foreground">
                ({t('legal.version')} {doc.version})
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm text-muted-foreground">
          {t('legal.agreeByClicking')}{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            {t('auth.termsOfService')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t('auth.privacyPolicy')}
          </Link>
          {t('auth.agree')}
        </p>

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="button"
          className="mt-5 w-full"
          disabled={submitting}
          onClick={handleAccept}
        >
          {submitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t('legal.accepting')}
            </>
          ) : (
            t('legal.acceptAndContinue')
          )}
        </Button>
      </div>
    </div>
  );
}
