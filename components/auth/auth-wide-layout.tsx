'use client';

import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';

/**
 * Themed frame for wide, scrollable auth-adjacent pages (store finder/picker).
 * Shares the emerald glow + language switcher with AuthLayout, but keeps a wide,
 * top-aligned container instead of the narrow centered auth card.
 */
export function AuthWideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LanguageDetector />
      <div
        className="auth-theme auth-glow relative min-h-screen px-4 py-12 text-foreground"
        dir="rtl"
      >
        <div className="fixed left-4 top-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </>
  );
}
