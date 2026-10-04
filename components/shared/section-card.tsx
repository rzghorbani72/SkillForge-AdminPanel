import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconBox, type IconBoxTone } from './icon-box';

type SectionCardProps = {
  title?: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconBoxTone;
  /** Shown at the end of the header, e.g. an "Edit" button. */
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** The standard white card of a page section: optional icon, title and hint, then its content. */
export function SectionCard({
  title,
  hint,
  icon,
  iconTone,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <Card className={cn('flex flex-col gap-4 p-5', className)}>
      {title ? (
        <header className="flex items-start gap-3">
          {icon ? <IconBox icon={icon} tone={iconTone} /> : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold">{title}</h2>
            {hint ? <p className="text-[13px] text-muted-foreground">{hint}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </Card>
  );
}
