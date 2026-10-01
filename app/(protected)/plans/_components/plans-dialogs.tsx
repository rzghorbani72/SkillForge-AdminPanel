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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { PlanFormDialog } from '@/components/plans/PlanFormDialog';
import { AcademyPlanFormDialog } from '@/components/plans/AcademyPlanFormDialog';
import {
  AcademyPlanData,
  PlanFormData,
  AcademyPlanFormData,
  SubscriptionPlanData,
} from '@/components/plans/plan-types';
import type { Dispatch, SetStateAction } from 'react';

export function PlansDialogs({
  academyPlanForm,
  deletingAcademyPlan,
  editingAcademyPlan,
  editingPlan,
  form,
  handleDeleteAcademyPlan,
  handleSaveAcademyPlan,
  handleSavePlan,
  isAcademyPlanFormOpen,
  isDeletingAcademyPlan,
  isFormOpen,
  isSaving,
  isSavingAcademyPlan,
  setAcademyPlanForm,
  setDeletingAcademyPlan,
  setForm,
  setIsAcademyPlanFormOpen,
  setIsFormOpen,
}: {
  academyPlanForm: AcademyPlanFormData;
  deletingAcademyPlan: AcademyPlanData | null;
  editingAcademyPlan: AcademyPlanData | null;
  editingPlan: SubscriptionPlanData | null;
  form: PlanFormData;
  handleDeleteAcademyPlan: () => Promise<void>;
  handleSaveAcademyPlan: () => Promise<void>;
  handleSavePlan: () => Promise<void>;
  isAcademyPlanFormOpen: boolean;
  isDeletingAcademyPlan: boolean;
  isFormOpen: boolean;
  isSaving: boolean;
  isSavingAcademyPlan: boolean;
  setAcademyPlanForm: Dispatch<SetStateAction<AcademyPlanFormData>>;
  setDeletingAcademyPlan: Dispatch<SetStateAction<AcademyPlanData | null>>;
  setForm: Dispatch<SetStateAction<PlanFormData>>;
  setIsAcademyPlanFormOpen: Dispatch<SetStateAction<boolean>>;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  return (
    <>
      <PlanFormDialog
        open={isFormOpen}
        editingPlan={editingPlan}
        form={form}
        isSaving={isSaving}
        onClose={() => setIsFormOpen(false)}
        onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
        onSave={handleSavePlan}
        t={t}
      />

      <AcademyPlanFormDialog
        open={isAcademyPlanFormOpen}
        editingPlan={editingAcademyPlan}
        form={academyPlanForm}
        isSaving={isSavingAcademyPlan}
        onClose={() => setIsAcademyPlanFormOpen(false)}
        onChange={(field, value) => setAcademyPlanForm((f) => ({ ...f, [field]: value }))}
        onSave={handleSaveAcademyPlan}
        t={t}
      />

      <Dialog open={!!deletingAcademyPlan} onOpenChange={(o) => !o && setDeletingAcademyPlan(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('plans.deletePlan')}
            </DialogTitle>
            <DialogDescription>{t('plans.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAcademyPlan(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAcademyPlan}
              disabled={isDeletingAcademyPlan}
            >
              {isDeletingAcademyPlan && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
