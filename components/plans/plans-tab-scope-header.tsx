'use client';

import { ScopeBadge } from '@/components/settings/scope-badge';
import type { SettingsScope } from '@/lib/settings-scope';

type PlansTabScopeHeaderProps = {
  scope: SettingsScope;
  title: string;
  description: string;
};

export function PlansTabScopeHeader({
  scope,
  title,
  description
}: PlansTabScopeHeaderProps) {
  return (
    <div className="mb-4 space-y-1 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <ScopeBadge scope={scope} showTooltip={false} />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
