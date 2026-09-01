'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import type { StorageFileUsage } from '@/lib/api';

interface StorageFileUsageCellProps {
  usages: StorageFileUsage[];
}

/**
 * Says exactly where a file lives — "Course › Lesson", the home page, branding —
 * because this screen has no delete: the manager goes to that place to remove it.
 */
export function StorageFileUsageCell({ usages }: StorageFileUsageCellProps) {
  const { t } = useTranslation();

  if (usages.length === 0) {
    return (
      <Badge variant="outline" className="font-normal">
        {t('storage.unused')}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {usages.map((usage, index) => {
        const areaLabel = t(`storage.area.${usage.area}`);
        const body = (
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {areaLabel}
            </Badge>
            {usage.context && (
              <>
                <span className="text-muted-foreground">{usage.context}</span>
                <ChevronLeft className="h-3 w-3 shrink-0 text-muted-foreground rtl:rotate-180" />
              </>
            )}
            {usage.label && <span className="truncate">{usage.label}</span>}
          </span>
        );

        return (
          <div key={`${usage.area}-${index}`} className="text-xs">
            {usage.href ? (
              <Link
                href={usage.href}
                className="hover:underline"
                title={t('storage.openLocation')}
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </div>
        );
      })}
    </div>
  );
}
