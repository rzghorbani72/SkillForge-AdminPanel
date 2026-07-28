'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Loader2 } from 'lucide-react';
import {
  apiClient,
  LEGAL_CONSENT_REQUIRED_EVENT,
  type LegalConsentRequiredDetail,
  type LegalPendingDocumentDiff
} from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { authService } from '@/lib/auth';
import { LegalDocumentDiff } from './legal-document-diff';

const DOCUMENT_LINKS: Record<string, string> = {
  TERMS: '/terms',
  PRIVACY: '/privacy'
};

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
  const [diffs, setDiffs] = useState<LegalPendingDocumentDiff[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  // Fetch the change diff only once the modal actually has something pending
  // — this is a nice-to-have, so a failure here never blocks acceptance.
  useEffect(() => {
    if (!pending || pending.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getLegalAcceptanceDiff(language);
        if (!cancelled && Array.isArray(res.data)) {
          setDiffs(res.data);
        }
      } catch {
        // Modal still works via the full-document links without the diff
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pending, language]);

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

  async function handleCancel() {
    setLoggingOut(true);
    // authService.logout() clears the session and redirects to /login itself
    await authService.logout();
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
    <>
      {/* Dashboard renders behind the gate — API calls stay paused until acceptance,
          so this is just the frozen last-known UI showing through the glass. */}
      {children}

      <div
        className="dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-consent-title"
        onClick={(e) => {
          // Outside the card means decline — there's no neutral "just close"
          // state, since requests stay paused until the user accepts or logs out.
          if (e.target === e.currentTarget) void handleCancel();
        }}
      >
        <div className="w-full max-w-2xl rounded-2xl border-[2px] border-gray-200 bg-white p-6 shadow-xl">
          <h2 id="legal-consent-title" className="text-xl font-bold">
            {t('legal.reacceptTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('legal.reacceptSubtitle')}
          </p>

          <ul className="beautiful-scrollbar mt-4 max-h-[50vh] space-y-3 overflow-y-auto text-sm">
            {pending.map((doc) => {
              const diffEntry = diffs.find((d) => d.type === doc.type);
              const fullDocHref = DOCUMENT_LINKS[doc.type];
              return (
                <li
                  key={doc.type}
                  className="rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{doc.title}</span>
                      <span className="ms-2 text-muted-foreground">
                        ({t('legal.version')} {doc.version})
                      </span>
                    </div>
                    {fullDocHref && (
                      <Link
                        href={fullDocHref}
                        className="shrink-0 text-xs text-primary underline hover:text-primary/80"
                      >
                        {t('legal.viewFullDocument')}
                      </Link>
                    )}
                  </div>

                  {diffEntry && <LegalDocumentDiff entry={diffEntry} />}
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-sm text-muted-foreground">
            {t('legal.agreeByClicking')}{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              {t('auth.termsOfService')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              {t('auth.privacyPolicy')}
            </Link>{' '}
            {t('auth.agree')}
          </p>

          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={submitting || loggingOut}
              onClick={handleCancel}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] border border-border text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {loggingOut ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('legal.decliningAndSigningOut')}
                </>
              ) : (
                t('legal.declineAndSignOut')
              )}
            </button>

            <button
              type="button"
              disabled={submitting || loggingOut}
              onClick={handleAccept}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('legal.accepting')}
                </>
              ) : (
                t('legal.acceptAndContinue')
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
