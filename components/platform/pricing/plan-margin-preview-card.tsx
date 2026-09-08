'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StructuredPlanLimits } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { previewPlanMargin } from './plan-margin-preview';

interface Props {
  revenueToman: number;
  limits: StructuredPlanLimits;
}

export function PlanMarginPreviewCard({ revenueToman, limits }: Props) {
  const { t } = useTranslation();
  const preview = useMemo(
    () => previewPlanMargin(revenueToman, limits),
    [revenueToman, limits]
  );

  if (revenueToman <= 0) return null;

  return (
    <div
      className={
        preview.ok
          ? 'rounded-xl border border-success/30 bg-success/5 p-4'
          : 'rounded-xl border border-destructive/30 bg-destructive/5 p-4'
      }
    >
      <div className="flex items-start gap-3">
        {preview.ok ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        )}
        <div className="space-y-1 text-sm">
          <p className="font-semibold">
            {preview.ok
              ? t('pricing.planLimits.marginOk', {
                  margin: preview.grossMarginPercent
                })
              : t('pricing.planLimits.marginLow', {
                  margin: preview.grossMarginPercent
                })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('pricing.planLimits.marginDetail', {
              cogs: preview.cogsPercent,
              driver: t(
                `pricing.planLimits.costDriver.${preview.topCostDriver}`
              )
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
