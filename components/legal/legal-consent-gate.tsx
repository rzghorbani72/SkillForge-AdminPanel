'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

type PendingLegalDocument = {
  type: string;
  title: string;
  version: string;
};

export function LegalConsentGate({ children }: { children: React.ReactNode }) {
  const { t, language } = useTranslation();
  const { user, isLoading: userLoading } = useAuthUser();
  const [pending, setPending] = useState<PendingLegalDocument[] | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await apiClient.getLegalAcceptanceStatus(language);
      const list = Array.isArray(res.data?.pending) ? res.data.pending : [];
      setPending(list);
      setError(null);
    } catch {
      setPending([]);
    }
  }, [language]);

  useEffect(() => {
    if (userLoading || !user) return;
    loadStatus();
  }, [loadStatus, user, userLoading]);

  async function handleAccept() {
    if (!accepted) {
      setError(t('legal.mustAcceptTerms'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.acceptPlatformLegalDocuments(language);
      await loadStatus();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (pending === null) {
    return <>{children}</>;
  }

  if (pending.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
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
            {t('legal.reacceptDescription')}
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

          <label className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              {t('auth.byCreatingAccount')}{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                {t('auth.termsOfService')}
              </Link>{' '}
              {t('auth.and')}{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                {t('auth.privacyPolicy')}
              </Link>
              {t('auth.agree')}
            </span>
          </label>

          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="mt-5 w-full"
            disabled={submitting || !accepted}
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
    </>
  );
}
