'use client';

import { BookOpen, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { AcademyPlanData, formatPrice } from './plan-types';

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
        <div className="rounded-2xl border bg-card py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('plans.noAcademyPlans')}</p>
          {canManage && (
            <Button onClick={onCreatePlan} variant="outline" size="sm" className="mt-4">
              <Plus className="me-2 h-4 w-4" />
              {t('plans.createFirstAcademyPlan')}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'flex items-center justify-between rounded-xl border bg-card px-5 py-4 transition-all',
                !plan.is_active && 'opacity-60',
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {plan.kind === 'SUBSCRIPTION' ? (
                    <Clock className="h-5 w-5 text-primary" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {plan.kind === 'SUBSCRIPTION'
                        ? t('plans.kindSubscription')
                        : t('plans.kindPackage')}
                    </Badge>
                    {!plan.is_active && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {t('plans.inactive')}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {formatPrice(plan.price)} {plan.currency}
                    </span>
                    {plan.kind === 'SUBSCRIPTION' && plan.duration_days && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('tutoring.durationDaysLabel', { days: plan.duration_days })}
                      </span>
                    )}
                    {plan.description && (
                      <span className="max-w-[200px] truncate">{plan.description}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={plan.is_active} onCheckedChange={() => onToggleActive(plan)} />
                <button
                  type="button"
                  aria-label={`Edit ${plan.name}`}
                  onClick={() => onEditPlan(plan)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${plan.name}`}
                  onClick={() => onDeletePlan(plan)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
