import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  /** Short text beside the title, e.g. "optional" or a count. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormSection({ icon: Icon, title, aside, className, children }: FormSectionProps) {
  return (
    <section className={cn('min-w-0 space-y-4', className)}>
      <header className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside ? <span className="ms-auto text-xs text-muted-foreground">{aside}</span> : null}
      </header>
      {children}
    </section>
  );
}
