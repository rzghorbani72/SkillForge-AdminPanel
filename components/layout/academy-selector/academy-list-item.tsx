import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Academy } from '@/types/api';
import { AcademyAvatar } from './academy-avatar';
import { AcademyStatusBadge } from './academy-status-badge';
import { getAcademyDomain } from './academy-utils';

/** One row in the academy switcher's popover list — used by both the manager
 * switcher (with a role badge) and the platform-admin switcher (without). */
export function AcademyListItem({
  academy,
  isActive,
  roleLabel,
  onClick,
}: {
  academy: Academy;
  isActive: boolean;
  roleLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent',
        isActive && 'bg-primary/5',
      )}
    >
      <AcademyAvatar name={academy.name} id={academy.id} logo={academy.logo} />
      <div className="min-w-0 flex-1 text-start">
        <p className={cn('truncate text-sm font-medium', isActive && 'text-primary')}>
          {academy.name}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs text-muted-foreground">{getAcademyDomain(academy)}</p>
          {roleLabel && (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {roleLabel}
            </span>
          )}
          <AcademyStatusBadge academy={academy} />
        </div>
      </div>
      {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}
