'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  emphasis?: boolean;
};

export function DetailField({ label, children, emphasis }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          'break-words',
          emphasis ? 'text-base font-semibold' : 'text-sm'
        )}
      >
        {children}
      </div>
    </div>
  );
}

type MediaChipProps = {
  label: string;
  attached: boolean;
  attachedLabel: string;
  missingLabel: string;
  icon: ReactNode;
};

export function MediaChip({
  label,
  attached,
  attachedLabel,
  missingLabel,
  icon
}: MediaChipProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </span>
      <Badge variant={attached ? 'default' : 'secondary'}>
        {attached ? attachedLabel : missingLabel}
      </Badge>
    </div>
  );
}
