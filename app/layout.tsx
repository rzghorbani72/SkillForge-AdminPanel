import type { Metadata } from 'next';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProviderWrapper } from '@/components/providers/theme-provider-wrapper';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/lib/i18n/provider';
import { getAdminLanguage, getAdminDirection } from '@/lib/i18n/server';
import { cookies } from 'next/headers';
import { ToastContainerWrapper } from '@/components/providers/toast-container-wrapper';
import { LanguageSync } from '@/components/providers/language-sync';

export const metadata: Metadata = {
  title: 'SkillForge Admin Panel',
  description:
    'Admin panel for SkillForge - Manage your schools, courses, and students'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Get language preference from cookies or default to English
  const cookieStore = await cookies();
  const languagePreference =
    cookieStore.get('preferred_language')?.value || null;

  // Try to get country code from school data if available
  // For now, we'll use language preference or default to English
  const language = getAdminLanguage(languagePreference, null);
  const direction = getAdminDirection(languagePreference, null);

  return (
    <html lang={language} dir={direction} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProviderWrapper>
          <I18nProvider initialLanguage={language}>
            <LanguageSync />
            {children}
            <Toaster />
            <ToastContainerWrapper />
          </I18nProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
