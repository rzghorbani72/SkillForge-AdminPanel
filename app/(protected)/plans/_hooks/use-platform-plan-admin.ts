'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  PlanFormData,
  SubscriptionPlanData,
  DEFAULT_PLAN_FORM,
} from '@/components/plans/plan-types';

export function usePlatformPlanAdmin({
  fetchSubscriptionPlans,
}: {
  fetchSubscriptionPlans: () => Promise<void>;
}) {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanData | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState<PlanFormData>(DEFAULT_PLAN_FORM);

  const [isSaving, setIsSaving] = useState(false);

  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlanData | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  function openCreate() {
    setEditingPlan(null);
    setForm(DEFAULT_PLAN_FORM);
    setIsFormOpen(true);
  }

  function openEdit(plan: SubscriptionPlanData) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      price_monthly: String(plan.price_monthly),
      price_yearly: String(plan.price_yearly ?? ''),
      storage_limit_gb: String(plan.storage_limit_gb),
      features: (plan.features ?? []).join('\n'),
      is_active: plan.is_active,
      sort_order: String(plan.sort_order),
    });
    setIsFormOpen(true);
  }

  async function handleSavePlan() {
    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        price_monthly: Number(form.price_monthly),
        price_yearly: form.price_yearly ? Number(form.price_yearly) : null,
        storage_limit_gb: Number(form.storage_limit_gb),
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
        commission_rate: null,
      };
      if (editingPlan) {
        await apiClient.updateSubscriptionPlan(editingPlan.id, payload);
      } else {
        await apiClient.createSubscriptionPlan(payload);
      }
      setIsFormOpen(false);
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePlan() {
    if (!deletingPlan) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteSubscriptionPlan(deletingPlan.id);
      setDeletingPlan(null);
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePlanActive(plan: SubscriptionPlanData) {
    try {
      await apiClient.updateSubscriptionPlan(plan.id, {
        is_active: !plan.is_active,
      });
      await fetchSubscriptionPlans();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }

  return {
    deletingPlan,
    editingPlan,
    form,
    handleDeletePlan,
    handleSavePlan,
    handleTogglePlanActive,
    isDeleting,
    isFormOpen,
    isSaving,
    openCreate,
    openEdit,
    setDeletingPlan,
    setForm,
    setIsFormOpen,
  };
}
