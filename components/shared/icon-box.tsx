import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export type IconBoxTone = 'primary' | 'muted' | 'success' | 'warn' | 'error';

const TONE: Record<IconBoxTone, string> = {
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warn: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  error: 'bg-destructive/10 text-destructive',
};

/** The rounded square that holds a card or row icon. */
export function IconBox({
  icon: Icon,
  tone = 'primary',
  className,
}: {
  icon: LucideIcon;
  tone?: IconBoxTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'grid h-9 w-9 shrink-0 place-items-center rounded-[10px]',
        TONE[tone],
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}
