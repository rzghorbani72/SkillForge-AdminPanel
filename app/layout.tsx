import type { Metadata } from 'next';
import './globals.css';
import { ThemeProviderWrapper } from '@/components/providers/theme-provider-wrapper';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/lib/i18n/provider';
import { getAdminLanguage, getAdminDirection } from '@/lib/i18n/server';
import { cookies } from 'next/headers';
import { ToastContainerWrapper } from '@/components/providers/toast-container-wrapper';
import { LanguageSync } from '@/components/providers/language-sync';
import { GdprConsentBanner } from '@/components/gdpr-consent-banner';

export const metadata: Metadata = {
  title: 'منتوما | mentoma.com',
  description: 'پنل مدیریت منتوما — مدیریت آکادمی‌ها، دوره‌ها و دانشجویان',
  robots: { index: false, follow: false }
};

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
    <html lang={language} dir={direction} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang="fa-IR"
          href={process.env.NEXT_PUBLIC_IR_DOMAIN ?? ''}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href={process.env.NEXT_PUBLIC_COM_DOMAIN ?? ''}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={process.env.NEXT_PUBLIC_COM_DOMAIN ?? ''}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProviderWrapper>
          <I18nProvider initialLanguage={language}>
            <LanguageSync />
            {children}
            <Toaster />
            <ToastContainerWrapper />
            {process.env.NEXT_PUBLIC_GDPR_ENABLED === 'true' && (
              <GdprConsentBanner />
            )}
          </I18nProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
