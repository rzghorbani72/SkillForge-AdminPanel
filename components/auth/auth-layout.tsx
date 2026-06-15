import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md';
}

export function AuthLayout({ children, maxWidth = 'sm' }: AuthLayoutProps) {
  return (
    <>
      <LanguageDetector />
      <div
        className="auth-theme auth-glow relative flex min-h-screen flex-col items-center justify-center p-4 text-foreground"
        dir="rtl"
      >
        <div className="fixed left-4 top-4 z-50">
          <LanguageSwitcher />
        </div>

        <div
          className={cn('w-full', maxWidth === 'md' ? 'max-w-md' : 'max-w-sm')}
        >
          {children}
        </div>
      </div>
    </>
  );
}
