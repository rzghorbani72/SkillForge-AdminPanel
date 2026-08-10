'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { VoucherFormData } from './voucher-types';

interface Props {
  open: boolean;
  isEditing: boolean;
  form: VoucherFormData;
  errors: Record<string, string>;
  onClose: () => void;
  onChange: (patch: Partial<VoucherFormData>) => void;
  onErrorChange: (patch: Record<string, string>) => void;
  onSave: () => void;
  t: (key: string) => string;
}

export function VoucherFormDialog({
  open,
  isEditing,
  form,
  errors,
  onClose,
  onChange,
  onErrorChange,
  onSave,
  t
}: Props) {
  function handleStartDateChange(newStartDate: string) {
    onChange({ start_date: newStartDate });
    if (errors.start_date) onErrorChange({ start_date: '' });
    if (
      form.end_date &&
      newStartDate &&
      new Date(form.end_date) <= new Date(newStartDate)
    ) {
      onErrorChange({ end_date: 'End date must be after start date' });
    } else if (
      errors.end_date &&
      form.end_date &&
      new Date(form.end_date) > new Date(newStartDate)
    ) {
      onErrorChange({ end_date: '' });
    }
  }

  function handleEndDateChange(newEndDate: string) {
    onChange({ end_date: newEndDate });
    if (errors.end_date) onErrorChange({ end_date: '' });
    if (
      form.start_date &&
      newEndDate &&
      new Date(newEndDate) <= new Date(form.start_date)
    ) {
      onErrorChange({ end_date: 'End date must be after start date' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('vouchers.editDialogTitle')
              : t('vouchers.createDialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('vouchers.editDialogDescription')
              : t('vouchers.createDialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Code {!isEditing && '*'}</Label>
            <Input
              value={form.code}
              disabled={isEditing}
              onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
              placeholder="SUMMER2024"
              className={
                isEditing
                  ? 'font-mono'
                  : 'uppercase placeholder:text-muted-foreground'
              }
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Summer sale discount"
              className="placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type *</Label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  onChange({
                    discount_type: e.target.value as 'PERCENT' | 'FIXED'
                  })
                }
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <Label>Discount Value *</Label>
              <NumberInput
                value={form.discount_value || ''}
                onChange={(raw) =>
                  onChange({ discount_value: raw === '' ? 0 : Number(raw) })
                }
                placeholder={form.discount_type === 'PERCENT' ? '20' : '1000'}
                required
                className="placeholder:text-muted-foreground"
              />
              {errors.discount_value && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discount_value}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Usage Type *</Label>
            <select
              value={form.usage_type}
              onChange={(e) =>
                onChange({
                  usage_type: e.target.value as
                    | 'ONE_TIME'
                    | 'LIMITED'
                    | 'UNLIMITED'
                    | 'USER_SPECIFIC'
                })
              }
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="UNLIMITED">Unlimited</option>
              <option value="ONE_TIME">One Time Per User</option>
              <option value="LIMITED">Limited Times</option>
            </select>
          </div>

          {form.usage_type === 'LIMITED' && (
            <div>
              <Label>Usage Limit *</Label>
              <NumberInput
                value={form.usage_limit ?? ''}
                onChange={(raw) =>
                  onChange({
                    usage_limit: raw === '' ? undefined : Number(raw)
                  })
                }
                placeholder="100"
                required
                className="placeholder:text-muted-foreground"
              />
              {errors.usage_limit && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.usage_limit}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                max={form.end_date || undefined}
                className={`placeholder:text-muted-foreground ${errors.start_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="datetime-local"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => handleEndDateChange(e.target.value)}
                required
                className={`placeholder:text-muted-foreground ${errors.end_date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Purchase Amount (optional)</Label>
              <NumberInput
                value={form.min_purchase_amount ?? ''}
                onChange={(raw) =>
                  onChange({
                    min_purchase_amount: raw === '' ? undefined : Number(raw)
                  })
                }
                placeholder="0"
                className="placeholder:text-muted-foreground"
              />
            </div>
            {form.discount_type === 'PERCENT' && (
              <div>
                <Label>Max Discount Amount (optional)</Label>
                <NumberInput
                  value={form.max_discount_amount ?? ''}
                  onChange={(raw) =>
                    onChange({
                      max_discount_amount: raw === '' ? undefined : Number(raw)
                    })
                  }
                  placeholder="0"
                  className="placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="voucher_is_active"
              checked={form.is_active}
              onChange={(e) => onChange({ is_active: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="voucher_is_active">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave}>
            {isEditing ? t('common.update') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
