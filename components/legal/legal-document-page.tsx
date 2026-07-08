'use client';

import Link from '@/components/ui/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useTranslation } from '@/lib/i18n/hooks';
import { t as translate } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/i18n/config';
import type { LegalDocument } from '@/lib/legal/types';

type LegalDocumentPageProps = {
  document: LegalDocument;
  html: string;
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

export function LegalDocumentPage({ document, html }: LegalDocumentPageProps) {
  const { t } = useTranslation();
  const docLang = documentLanguage(document.locale);
  const label = (key: string) => translate(key, docLang);
  const publishedAt = document.published_at
    ? new Date(document.published_at).toLocaleDateString(
        docLang === 'fa' ? 'fa-IR' : docLang === 'ar' ? 'ar' : undefined,
        { year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null;

  return (
    <AuthLayout
      maxWidth="lg"
      scrollable
      dir={document.locale === 'fa' || document.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="auth-card fade-in-up w-full rounded-2xl p-7">
        <header className="mb-6 shrink-0 border-b border-border pb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {publishedAt && (
              <>
                {label('legal.lastUpdated')}: {publishedAt} ·{' '}
              </>
            )}
            {label('legal.version')} {document.version}
          </p>
        </header>

        <article
          className="legal-document max-h-none space-y-4 overflow-y-visible text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:border-primary [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-6 [&_hr]:border-border [&_li]:ms-5 [&_ol]:list-decimal [&_p]:text-muted-foreground [&_ul]:list-disc"
          dir={
            document.locale === 'fa' || document.locale === 'ar' ? 'rtl' : 'ltr'
          }
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-border pt-6 text-sm">
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
