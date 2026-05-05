import { cookies } from 'next/headers';
import { isAuth } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ProtectedLayoutWrapper } from '@/components/providers/protected-layout-wrapper';
import {
  fetchAdminThemeConfigs,
  generateAdminThemeCSS
} from '@/lib/theme-server';

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!isAuth(cookieStore)) {
    redirect('/login');
  }

  // Fetch theme server-side so the first paint already has correct colors,
  // eliminating the flash from default theme to custom theme on every page load.
  const jwtToken = cookieStore.get('jwt')?.value;
  const themeConfigs = await fetchAdminThemeConfigs(jwtToken);
  const themeCSS = generateAdminThemeCSS(themeConfigs);

  return (
    <>
      {themeCSS && (
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeCSS }}
        />
      )}
      <ProtectedLayoutWrapper>{children}</ProtectedLayoutWrapper>
    </>
  );
}
