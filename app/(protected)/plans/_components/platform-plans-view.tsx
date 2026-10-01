'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { SubscriptionPlanData, type BillingPeriod } from '@/components/plans/plan-types';
import { PlatformPlansAdmin } from './platform-plans-admin';
import type { Dispatch, SetStateAction, JSX } from 'react';

export function PlatformPlansView({
  academyPlansPanel,
  deletingPlan,
  fetchAcademyPlans,
  handleDeletePlan,
  handleTogglePlanActive,
  isDeleting,
  openCreate,
  openEdit,
  period,
  plans,
  popularIndex,
  setDeletingPlan,
  setPeriod,
  sharedDialogs,
}: {
  academyPlansPanel: JSX.Element;
  deletingPlan: SubscriptionPlanData | null;
  fetchAcademyPlans: () => Promise<void>;
  handleDeletePlan: () => Promise<void>;
  handleTogglePlanActive: (plan: SubscriptionPlanData) => Promise<void>;
  isDeleting: boolean;
  openCreate: () => void;
  openEdit: (plan: SubscriptionPlanData) => void;
  period: BillingPeriod;
  plans: SubscriptionPlanData[];
  popularIndex: number;
  setDeletingPlan: Dispatch<SetStateAction<SubscriptionPlanData | null>>;
  setPeriod: Dispatch<SetStateAction<BillingPeriod>>;
  sharedDialogs: JSX.Element;
}) {
  const { t } = useTranslation();
  return (
    <div className="fade-in-up flex-1 space-y-6 p-4 sm:p-6" dir="rtl">
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t('plans.badge')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('plans.title')}</h1>
      </div>

      <Tabs
        defaultValue="platform"
        onValueChange={(v) => {
          if (v === 'academy') fetchAcademyPlans();
        }}
      >
        <TabsList>
          <TabsTrigger value="platform">{t('plans.platformPlansTab')}</TabsTrigger>
          <TabsTrigger value="academy">{t('plans.academyPlansTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6 pt-4">
          <PlatformPlansAdmin
            plans={plans}
            period={period}
            setPeriod={setPeriod}
            popularIndex={popularIndex}
            onOpenCreate={openCreate}
            onEdit={openEdit}
            onDelete={setDeletingPlan}
            onToggleActive={handleTogglePlanActive}
            t={t}
          />
        </TabsContent>

        <TabsContent value="academy" className="pt-4">
          {academyPlansPanel}
        </TabsContent>
      </Tabs>

      <Dialog open={!!deletingPlan} onOpenChange={(o) => !o && setDeletingPlan(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('plans.deletePlan')}
            </DialogTitle>
            <DialogDescription>{t('plans.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPlan(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={isDeleting}>
              {isDeleting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sharedDialogs}
    </div>
  );
}
