'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CatalogResource } from '@/types/roles';

interface PermissionGridProps {
  resources: CatalogResource[];
  /** Granted keys in "resource:action" form. */
  granted: Set<string>;
  onToggle: (resource: string, action: string) => void;
  onToggleResource: (resource: string, grantAll: boolean) => void;
  readOnly?: boolean;
}

export const permissionKey = (resource: string, action: string) =>
  `${resource}:${action}`;

export function PermissionGrid({
  resources,
  granted,
  onToggle,
  onToggleResource,
  readOnly = false
}: PermissionGridProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return resources;
    return resources.filter(
      (entry) =>
        entry.resource.includes(needle) ||
        t(`roles.resource.${entry.resource}`).toLowerCase().includes(needle)
    );
  }, [resources, query, t]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('roles.searchResource')}
          className="h-9 ltr:pl-9 rtl:pr-9"
        />
      </div>

      <div className="space-y-2">
        {visible.map((entry) => {
          const grantedCount = entry.actions.filter((action) =>
            granted.has(permissionKey(entry.resource, action))
          ).length;
          const allGranted = grantedCount === entry.actions.length;

          return (
            <div
              key={entry.resource}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
            >
              <span className="text-sm font-medium">
                {t(`roles.resource.${entry.resource}`)}
              </span>
              <div className="flex items-center gap-4">
                {entry.actions.map((action) => {
                  const key = permissionKey(entry.resource, action);
                  return (
                    <label
                      key={action}
                      className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground"
                    >
                      <Checkbox
                        checked={granted.has(key)}
                        disabled={readOnly}
                        onCheckedChange={() => onToggle(entry.resource, action)}
                      />
                      {t(`roles.action.${action}`)}
                    </label>
                  );
                })}
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      onToggleResource(entry.resource, !allGranted)
                    }
                  >
                    {allGranted ? t('roles.selectNone') : t('roles.selectAll')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('roles.noResourceMatch')}
          </p>
        )}
      </div>
    </div>
  );
}
