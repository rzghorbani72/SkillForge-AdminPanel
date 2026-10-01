'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  AcademyPlanData,
  AcademyPlanFormData,
  DEFAULT_ACADEMY_PLAN_FORM,
} from '@/components/plans/plan-types';

export function useAcademyPlanAdmin() {
  const [academyPlans, setAcademyPlans] = useState<AcademyPlanData[]>([]);

  const [isAcademyPlansLoading, setIsAcademyPlansLoading] = useState(false);

  const [editingAcademyPlan, setEditingAcademyPlan] = useState<AcademyPlanData | null>(null);

  const [isAcademyPlanFormOpen, setIsAcademyPlanFormOpen] = useState(false);

  const [academyPlanForm, setAcademyPlanForm] =
    useState<AcademyPlanFormData>(DEFAULT_ACADEMY_PLAN_FORM);

  const [isSavingAcademyPlan, setIsSavingAcademyPlan] = useState(false);

  const [deletingAcademyPlan, setDeletingAcademyPlan] = useState<AcademyPlanData | null>(null);

  const [isDeletingAcademyPlan, setIsDeletingAcademyPlan] = useState(false);

  const fetchAcademyPlans = useCallback(async () => {
    try {
      setIsAcademyPlansLoading(true);
      const data = await apiClient.getAcademyPlans().catch(() => []);
      setAcademyPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsAcademyPlansLoading(false);
    }
  }, []);

  function openCreateAcademyPlan() {
    setEditingAcademyPlan(null);
    setAcademyPlanForm(DEFAULT_ACADEMY_PLAN_FORM);
    setIsAcademyPlanFormOpen(true);
  }

  function openEditAcademyPlan(plan: AcademyPlanData) {
    setEditingAcademyPlan(plan);
    setAcademyPlanForm({
      kind: plan.kind,
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      duration_days: plan.duration_days != null ? String(plan.duration_days) : '',
      is_active: plan.is_active,
    });
    setIsAcademyPlanFormOpen(true);
  }

  async function handleSaveAcademyPlan() {
    try {
      setIsSavingAcademyPlan(true);
      const dto = {
        kind: academyPlanForm.kind,
        name: academyPlanForm.name.trim(),
        description: academyPlanForm.description.trim() || undefined,
        price: Number(academyPlanForm.price),
        duration_days:
          academyPlanForm.kind === 'SUBSCRIPTION' && academyPlanForm.duration_days
            ? Number(academyPlanForm.duration_days)
            : undefined,
      };
      if (editingAcademyPlan) {
        await apiClient.updateAcademyPlan(editingAcademyPlan.id, {
          ...dto,
          is_active: academyPlanForm.is_active,
        });
      } else {
        await apiClient.createAcademyPlan(dto);
      }
      setIsAcademyPlanFormOpen(false);
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSavingAcademyPlan(false);
    }
  }

  async function handleDeleteAcademyPlan() {
    if (!deletingAcademyPlan) return;
    try {
      setIsDeletingAcademyPlan(true);
      await apiClient.deleteAcademyPlan(deletingAcademyPlan.id);
      setDeletingAcademyPlan(null);
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsDeletingAcademyPlan(false);
    }
  }

  async function handleToggleAcademyPlanActive(plan: AcademyPlanData) {
    try {
      await apiClient.updateAcademyPlan(plan.id, {
        is_active: !plan.is_active,
      });
      await fetchAcademyPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }

  return {
    academyPlanForm,
    academyPlans,
    deletingAcademyPlan,
    editingAcademyPlan,
    fetchAcademyPlans,
    handleDeleteAcademyPlan,
    handleSaveAcademyPlan,
    handleToggleAcademyPlanActive,
    isAcademyPlanFormOpen,
    isAcademyPlansLoading,
    isDeletingAcademyPlan,
    isSavingAcademyPlan,
    openCreateAcademyPlan,
    openEditAcademyPlan,
    setAcademyPlanForm,
    setDeletingAcademyPlan,
    setIsAcademyPlanFormOpen,
  };
}
