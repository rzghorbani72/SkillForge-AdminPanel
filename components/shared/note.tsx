import type { ReactNode } from 'react';
import { Check, CircleAlert, Info, type LucideIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';

export type NoteTone = 'info' | 'warn' | 'error' | 'success';

const TONE = {
  info: { variant: 'default', icon: Info },
  warn: { variant: 'warning', icon: CircleAlert },
  error: { variant: 'destructive', icon: CircleAlert },
  success: { variant: 'success', icon: Check },
} as const;

/** A tinted message box with its icon: a hint, a risk, an error or a confirmation. */
export function Note({
  tone = 'info',
  icon,
  className,
  children,
}: {
  tone?: NoteTone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  const Icon = icon ?? TONE[tone].icon;
  return (
    <Alert
      variant={TONE[tone].variant}
      role={tone === 'error' ? 'alert' : 'note'}
      className={className}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
