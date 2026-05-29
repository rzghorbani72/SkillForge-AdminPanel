import { LanguageDetector } from '@/components/providers/language-detector';
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
        className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
        dir="rtl"
      >
        <div
          className={cn('w-full', maxWidth === 'md' ? 'max-w-md' : 'max-w-sm')}
        >
          {children}
        </div>
      </div>
    </>
  );
}
