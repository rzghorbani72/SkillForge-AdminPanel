import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProviderWrapper } from '@/components/providers/theme-provider-wrapper';
import { I18nProvider } from '@/lib/i18n/provider';
import { getAdminLanguage, getAdminDirection } from '@/lib/i18n/server';
import { cookies } from 'next/headers';
import { ToastContainerWrapper } from '@/components/providers/toast-container-wrapper';
import { LanguageSync } from '@/components/providers/language-sync';
import { GdprConsentBanner } from '@/components/gdpr-consent-banner';
import { buildPanelMetadata } from '@/lib/seo/panel-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const languagePreference =
    cookieStore.get('preferred_language')?.value || null;
  const language = getAdminLanguage(languagePreference, null);
  return buildPanelMetadata(language);
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const languagePreference =
    cookieStore.get('preferred_language')?.value || null;

  const language = getAdminLanguage(languagePreference, null);
  const direction = getAdminDirection(languagePreference, null);

  return (
    <html
      lang={language}
      dir={direction}
      translate="no"
      className="notranslate"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <link
          rel="preload"
          href="/fonts/vazirmatn.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <ThemeProviderWrapper>
            <I18nProvider initialLanguage={language}>
              <LanguageSync />
              {children}
              <ToastContainerWrapper />
              {process.env.NEXT_PUBLIC_GDPR_ENABLED === 'true' && (
                <GdprConsentBanner />
              )}
            </I18nProvider>
          </ThemeProviderWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
