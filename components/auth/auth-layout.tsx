import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  scrollable?: boolean;
  dir?: 'rtl' | 'ltr';
  /** Design pins the card to the left edge; centered is used by wide pages. */
  align?: 'left' | 'center';
}

const MAX_WIDTH_CLASS = {
  sm: 'max-w-[526px]',
  md: 'max-w-md',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl'
} as const;

export function AuthLayout({
  children,
  maxWidth = 'sm',
  scrollable = false,
  dir = 'rtl',
  align = 'left'
}: AuthLayoutProps) {
  return (
    <>
      <LanguageDetector />
      <div
        className={cn(
          'auth-theme auth-glow relative flex flex-col p-4 text-foreground',
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
            'mx-auto w-full',
            MAX_WIDTH_CLASS[maxWidth],
            align === 'left' && 'lg:ml-[4.3%] lg:mr-auto'
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
