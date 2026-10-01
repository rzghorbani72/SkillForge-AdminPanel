'use client';

import { Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { type PlatformSettingsData, type SubscriptionPlanData } from '@/lib/api';
import { PlanFormFields, type PlanFormState } from '@/components/platform/pricing/plan-form-fields';
import { formatIRR, formatToman, irrToToman } from '@/components/platform/pricing/pricing-helpers';
import type { Dispatch, SetStateAction } from 'react';

export function PlatformPlansCard({
  cancelPlan,
  deletingPlanId,
  editingPlanId,
  handleDeletePlan,
  handleSavePlan,
  planForm,
  plans,
  savingPlan,
  setPlanForm,
  settings,
  startEditPlan,
  startNewPlan,
}: {
  cancelPlan: () => void;
  deletingPlanId: string | null;
  editingPlanId: string | null;
  handleDeletePlan: (id: string) => Promise<void>;
  handleSavePlan: () => Promise<void>;
  planForm: PlanFormState;
  plans: SubscriptionPlanData[];
  savingPlan: boolean;
  setPlanForm: Dispatch<SetStateAction<PlanFormState>>;
  settings: PlatformSettingsData | null;
  startEditPlan: (plan: SubscriptionPlanData) => void;
  startNewPlan: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{t('pricing.platform.plansTitle')}</CardTitle>
          <CardDescription>{t('pricing.platform.plansDesc')}</CardDescription>
        </div>
        <Button size="sm" onClick={startNewPlan} disabled={editingPlanId !== null}>
          <Plus className="me-2 h-4 w-4" /> {t('pricing.platform.newPlan')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editingPlanId !== null && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold">
              {editingPlanId === 'new'
                ? t('pricing.platform.newPlan')
                : t('pricing.platform.editPlan')}
            </h3>
            <PlanFormFields
              form={planForm}
              isNew={editingPlanId === 'new'}
              onChange={setPlanForm}
              costs={settings ?? undefined}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancelPlan}>
                <X className="me-1 h-3 w-3" /> {t('pricing.platform.cancel')}
              </Button>
              <Button size="sm" onClick={handleSavePlan} disabled={savingPlan}>
                <Check className="me-1 h-3 w-3" />
                {savingPlan ? t('pricing.platform.saving') : t('pricing.platform.savePlan')}
              </Button>
            </div>
          </div>
        )}

        {plans.length === 0 && editingPlanId === null ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('pricing.platform.noPlans')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pricing.platform.colName')}</TableHead>
                <TableHead>{t('pricing.platform.colMonthly')}</TableHead>
                <TableHead>{t('pricing.platform.colAnnual')}</TableHead>
                <TableHead>{t('pricing.platform.colStorage')}</TableHead>
                <TableHead>{t('pricing.platform.colStatus')}</TableHead>
                <TableHead className="text-end">{t('pricing.platform.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <div>{plan.name}</div>
                    <div className="text-xs text-muted-foreground">{plan.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div>{formatToman(irrToToman(plan.price_monthly))}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatIRR(plan.price_monthly)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.price_yearly != null ? (
                      <>
                        <div>{formatToman(irrToToman(plan.price_yearly))}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatIRR(plan.price_yearly)}
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{plan.storage_limit_gb} GB</TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active
                        ? t('pricing.platform.statusActive')
                        : t('pricing.platform.statusInactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-1 text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditPlan(plan)}
                      disabled={editingPlanId !== null}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={deletingPlanId === plan.id || editingPlanId !== null}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
