'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademyPlanRow } from './academy-plan-row';
import { AcademyPlansEmptyState } from './academy-plans-empty-state';
import { AcademyPlanData } from './plan-types';

interface Props {
  plans: AcademyPlanData[];
  isLoading: boolean;
  canManage: boolean;
  onCreatePlan: () => void;
  onEditPlan: (plan: AcademyPlanData) => void;
  onDeletePlan: (plan: AcademyPlanData) => void;
  onToggleActive: (plan: AcademyPlanData) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function AcademyPlansList({
  plans,
  isLoading,
  canManage,
  onCreatePlan,
  onEditPlan,
  onDeletePlan,
  onToggleActive,
  t,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('plans.subtitle')}</p>
        {canManage && (
          <Button onClick={onCreatePlan} size="sm">
            <Plus className="me-2 h-4 w-4" />
            {t('plans.createAcademyPlan')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <AcademyPlansEmptyState canManage={canManage} onCreatePlan={onCreatePlan} t={t} />
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <AcademyPlanRow
              key={plan.id}
              plan={plan}
              onEdit={onEditPlan}
              onDelete={onDeletePlan}
              onToggleActive={onToggleActive}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
