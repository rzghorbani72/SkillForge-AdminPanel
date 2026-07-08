import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  scrollable?: boolean;
  dir?: 'rtl' | 'ltr';
}

export function AuthLayout({
  children,
  maxWidth = 'sm',
  scrollable = false,
  dir = 'rtl'
}: AuthLayoutProps) {
  return (
    <>
      <LanguageDetector />
      <div
        className={cn(
          'auth-theme auth-glow relative flex flex-col items-center p-4 text-foreground',
          scrollable
            ? 'fixed inset-0 z-0 overflow-y-auto overscroll-y-contain py-8'
            : 'min-h-screen justify-center'
        )}
        dir={dir}
      >
        <div className="fixed left-4 top-4 z-50">
          <LanguageSwitcher />
        </div>

        <div
          className={cn(
            'w-full',
            maxWidth === 'lg'
              ? 'max-w-3xl'
              : maxWidth === 'md'
                ? 'max-w-md'
                : 'max-w-sm'
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
