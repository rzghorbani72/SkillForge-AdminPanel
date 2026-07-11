'use client';

import { ScopeBadge } from '@/components/settings/scope-badge';
import type { SettingsScope } from '@/lib/settings-scope';
import { useTranslation } from '@/lib/i18n/hooks';

type SettingsSectionHeaderProps = {
  title: string;
  subtitle?: string;
  scope?: SettingsScope;
  scopeDescription?: string;
};

export function SettingsSectionHeader({
  title,
  subtitle,
  scope,
  scopeDescription
}: SettingsSectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {scope ? <ScopeBadge scope={scope} /> : null}
      </div>
      {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      {scope && scopeDescription ? (
        <p className="text-sm text-muted-foreground">{scopeDescription}</p>
      ) : scope ? (
        <p className="text-sm text-muted-foreground">
          {t(`settings.scope.${scope}Description`)}
        </p>
      ) : null}
    </div>
  );
}
