'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SubscriptionPlanData, PlanFormData } from './plan-types';
import { MESSAGES } from '@/constants/messages';

interface Props {
  open: boolean;
  editingPlan: SubscriptionPlanData | null;
  form: PlanFormData;
  isSaving: boolean;
  onClose: () => void;
  onChange: (field: keyof PlanFormData, value: string | boolean) => void;
  onSave: () => void;
  t: (key: string) => string;
}

export function PlanFormDialog({
  open,
  editingPlan,
  form,
  isSaving,
  onClose,
  onChange,
  onSave,
  t
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingPlan
              ? MESSAGES.planForm.editPlan(editingPlan.name)
              : MESSAGES.planForm.createPlan}
          </DialogTitle>
          <DialogDescription>
            {editingPlan
              ? MESSAGES.planForm.editPlanDesc
              : MESSAGES.planForm.createPlanDesc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{MESSAGES.planForm.name}</Label>
              <Input
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Pro"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{MESSAGES.planForm.slug}</Label>
              <Input
                value={form.slug}
                onChange={(e) => onChange('slug', e.target.value)}
                placeholder="pro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{MESSAGES.planForm.monthlyPrice}</Label>
              <Input
                type="number"
                value={form.price_monthly}
                onChange={(e) => onChange('price_monthly', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{MESSAGES.planForm.yearlyPrice}</Label>
              <Input
                type="number"
                value={form.price_yearly}
                onChange={(e) => onChange('price_yearly', e.target.value)}
                placeholder={t('common.optional')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{MESSAGES.planForm.storageGb}</Label>
              <Input
                type="number"
                value={form.storage_limit_gb}
                onChange={(e) => onChange('storage_limit_gb', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plans.sortOrder')}</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => onChange('sort_order', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{MESSAGES.planForm.featuresPerLine}</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.features}
              onChange={(e) => onChange('features', e.target.value)}
              placeholder={'Unlimited courses\nPriority support\nCustom domain'}
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => onChange('is_active', v)}
            />
            <div>
              <p className="text-sm font-medium">{t('plans.toggleActive')}</p>
              <p className="text-xs text-muted-foreground">
                {MESSAGES.planForm.activePlanNote}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !form.name}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {editingPlan
              ? MESSAGES.planForm.saveChanges
              : MESSAGES.planForm.createPlan}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
