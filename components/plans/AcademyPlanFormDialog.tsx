'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AcademyPlanData, AcademyPlanFormData } from './plan-types';

interface Props {
  open: boolean;
  editingPlan: AcademyPlanData | null;
  form: AcademyPlanFormData;
  isSaving: boolean;
  onClose: () => void;
  onChange: (field: keyof AcademyPlanFormData, value: string | boolean) => void;
  onSave: () => void;
  t: (key: string) => string;
}

export function AcademyPlanFormDialog({
  open,
  editingPlan,
  form,
  isSaving,
  onClose,
  onChange,
  onSave,
  t,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? t('plans.editAcademyPlan') : t('plans.createAcademyPlan')}
          </DialogTitle>
          <DialogDescription>{t('plans.dialogSubtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t('plans.nameLabel')}</Label>
            <Input
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder={t('plans.namePlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('plans.descriptionLabel')}</Label>
            <Input
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder={t('common.optional')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('plans.priceLabel')}</Label>
              <PriceInput value={form.price} onChange={(raw) => onChange('price', raw)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plans.durationDays')}</Label>
              <NumberInput
                value={form.duration_days}
                onChange={(raw) => onChange('duration_days', raw)}
                placeholder={t('plans.durationPlaceholder')}
              />
            </div>
          </div>

          {editingPlan && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => onChange('is_active', v)} />
              <p className="text-sm font-medium">{t('plans.toggleActive')}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !form.name}>
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {editingPlan ? t('plans.editAcademyPlan') : t('plans.createAcademyPlan')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
