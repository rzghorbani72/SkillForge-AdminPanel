'use client';

import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export function TeacherPlansView() {
  const { t } = useTranslation();
  return (
    <div className="fade-in-up flex-1 space-y-8 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t('plans.badge')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('plans.title')}</h1>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
          <Eye className="h-3.5 w-3.5" />
          {t('plans.viewOnly')}
        </Badge>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl border border-info/20 bg-info/5 px-4 py-3 text-sm text-info">
        <Eye className="h-4 w-4 shrink-0" />
        {t('plans.teacherNote')}
      </div>
    </div>
  );
}
