'use client';

import { Info } from 'lucide-react';
import Link from '@/components/ui/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useTranslation } from '@/lib/i18n/hooks';
import { t as translate } from '@/lib/i18n';
import { getTextDirection } from '@/lib/i18n/config';
import type { LanguageCode } from '@/lib/i18n/config';
import type { LegalDocument } from '@/lib/legal/types';
import { sanitizeRichText } from '@/lib/sanitize';

type LegalDocumentPageProps = {
  document: LegalDocument;
  html: string;
  /** The UI language the reader actually asked for (may differ from the
   *  document's own locale when no translation exists yet and the backend
   *  fell back to another language). */
  requestedLocale: LanguageCode;
};

function documentLanguage(locale: string): LanguageCode {
  if (
    locale === 'fa' ||
    locale === 'ar' ||
    locale === 'tr' ||
    locale === 'en'
  ) {
    return locale;
  }
  return 'fa';
}

export function LegalDocumentPage({
  document,
  html,
  requestedLocale
}: LegalDocumentPageProps) {
  const { t } = useTranslation();
  const docLang = documentLanguage(document.locale);
  const label = (key: string) => translate(key, docLang);
  const publishedAt = document.published_at
    ? new Date(document.published_at).toLocaleDateString(
        docLang === 'fa' ? 'fa-IR' : docLang === 'ar' ? 'ar' : undefined,
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null;

  const safeHtml = sanitizeRichText(html);

  return (
    <AuthLayout
      maxWidth="xl"
      scrollable
      align="center"
      dir={document.locale === 'fa' || document.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="auth-card legal-card fade-in-up w-full rounded-2xl p-7 sm:p-12">
        <header className="mb-8 shrink-0 border-b border-border pb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {publishedAt && (
              <>
                {label('legal.lastUpdated')}: {publishedAt} ·{' '}
              </>
            )}
            {label('legal.version')} {document.version}
          </p>
        </header>

        {requestedLocale !== docLang && (
          <Alert className="mb-6" dir={getTextDirection(requestedLocale)}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {translate('legal.notTranslatedNotice', requestedLocale)}
            </AlertDescription>
          </Alert>
        )}

        <article
          className="legal-document max-h-none space-y-3 overflow-y-visible text-base leading-8 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h1]:mb-4 [&_h1]:mt-10 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:first:mt-0 [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-8 [&_hr]:border-border [&_li]:mb-1 [&_li]:ms-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-3 [&_th]:text-start [&_th]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1"
          dir={
            document.locale === 'fa' || document.locale === 'ar' ? 'rtl' : 'ltr'
          }
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3 border-t border-border pt-6 text-sm">
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t('auth.backToLogin')}
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            {t('auth.register')}
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t('auth.footer')}
      </p>
    </AuthLayout>
  );
}
