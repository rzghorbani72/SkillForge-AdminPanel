'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/lib/i18n/hooks';
import { SETTINGS_SCOPE_I18N, type SettingsScope } from '@/lib/settings-scope';
import { cn } from '@/lib/utils';

const SCOPE_STYLES: Record<SettingsScope, string> = {
  personal:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  platform:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
  academy:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

type ScopeBadgeProps = {
  scope: SettingsScope;
  className?: string;
  showTooltip?: boolean;
};

export function ScopeBadge({ scope, className, showTooltip = true }: ScopeBadgeProps) {
  const { t } = useTranslation();
  const keys = SETTINGS_SCOPE_I18N[scope];
  const label = t(keys.label);
  const description = t(keys.description);

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wide',
        SCOPE_STYLES[scope],
        className,
      )}
    >
      {label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
