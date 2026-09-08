'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Trash2, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { PlanMarginPreviewCard } from '@/components/platform/pricing/plan-margin-preview-card';
import {
  AcademyCustomPlanFormData,
  DEFAULT_CUSTOM_PLAN_FORM,
  StructuredPlanLimits
} from './plan-types';

interface Props {
  academyId: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LIMIT_FIELDS: Array<{
  key: keyof StructuredPlanLimits;
  labelKey: string;
}> = [
  { key: 'teachers', labelKey: 'teachers' },
  { key: 'managers', labelKey: 'managers' },
  { key: 'courses', labelKey: 'courses' },
  { key: 'seasons_per_course', labelKey: 'seasonsPerCourse' },
  { key: 'lessons_per_course', labelKey: 'lessonsPerCourse' },
  { key: 'tutoring_students', labelKey: 'tutoringStudents' },
  { key: 'storage_gb', labelKey: 'storageGb' },
  { key: 'videos', labelKey: 'videos' },
  { key: 'dedicated_templates', labelKey: 'dedicatedTemplates' }
];

export function AcademyCustomPlanCard({ academyId, t }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [assignedAt, setAssignedAt] = useState<string | null>(null);
  const [form, setForm] = useState<AcademyCustomPlanFormData>(
    DEFAULT_CUSTOM_PLAN_FORM
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAcademyCustomPlan(academyId);
      setIsEnabled(!!data?.custom_plan_enabled);
      setAssignedAt(data?.custom_plan_assigned_at ?? null);
      setForm({
        name: data?.custom_plan_name ?? '',
        limits: LIMIT_FIELDS.reduce(
          (acc, { key }) => ({
            ...acc,
            [key]: String(
              data?.custom_plan_limits?.[key] ??
                DEFAULT_CUSTOM_PLAN_FORM.limits[key]
            )
          }),
          {} as AcademyCustomPlanFormData['limits']
        ),
        features: Array.isArray(data?.custom_plan_features)
          ? data.custom_plan_features.join('\n')
          : '',
        price_monthly_toman:
          data?.custom_plan_price_monthly != null
            ? String(data.custom_plan_price_monthly)
            : '',
        price_yearly_toman:
          data?.custom_plan_price_yearly != null
            ? String(data.custom_plan_price_yearly)
            : '',
        note: data?.custom_plan_note ?? '',
        margin_override: false
      });
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    void load();
  }, [load]);

  function onLimitChange(key: keyof StructuredPlanLimits, value: string) {
    setForm((f) => ({ ...f, limits: { ...f.limits, [key]: value } }));
  }

  const parsedLimits = useMemo(
    () =>
      LIMIT_FIELDS.reduce(
        (acc, { key }) => ({
          ...acc,
          [key]: Number(form.limits[key]) || 0
        }),
        {} as StructuredPlanLimits
      ),
    [form.limits]
  );

  const revenueToman = Number(form.price_monthly_toman) || 0;

  async function handleSave() {
    try {
      setIsSaving(true);
      await apiClient.setAcademyCustomPlan(academyId, {
        name: form.name.trim(),
        limits: parsedLimits,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        price_monthly_toman: form.price_monthly_toman
          ? Number(form.price_monthly_toman)
          : undefined,
        price_yearly_toman: form.price_yearly_toman
          ? Number(form.price_yearly_toman)
          : undefined,
        note: form.note.trim() || undefined,
        margin_override: form.margin_override || undefined
      });
      toast.success(t('platform.stores.customPlan.saveSuccess'));
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    try {
      setIsClearing(true);
      await apiClient.clearAcademyCustomPlan(academyId);
      toast.success(t('platform.stores.customPlan.clearSuccess'));
      setIsClearConfirmOpen(false);
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsClearing(false);
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isEnabled
                ? t('platform.stores.customPlan.enabledBadge')
                : t('platform.stores.customPlan.title')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEnabled
                ? assignedAt
                  ? `${t('platform.stores.customPlan.assignedAt')}: ${new Date(assignedAt).toLocaleDateString('fa-IR')}`
                  : t('platform.stores.customPlan.description')
                : t('platform.stores.customPlan.disabledHint')}
            </p>
          </div>
        </div>
        <span
          className={
            isEnabled
              ? 'rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success'
              : 'rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'
          }
        >
          {isEnabled ? t('common.active') : t('common.inactive')}
        </span>
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="space-y-1.5">
          <Label>{t('platform.stores.customPlan.nameLabel')}</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('platform.stores.customPlan.namePlaceholder')}
          />
        </div>

        <div>
          <Label className="mb-2 block">
            {t('platform.stores.customPlan.limitsTitle')}
          </Label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {LIMIT_FIELDS.map(({ key, labelKey }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {t(`platform.stores.customPlan.${labelKey}`)}
                </Label>
                <NumberInput
                  value={form.limits[key]}
                  onChange={(raw) => onLimitChange(key, raw)}
                />
              </div>
            ))}
          </div>
        </div>

        {revenueToman > 0 && (
          <PlanMarginPreviewCard
            revenueToman={revenueToman}
            limits={parsedLimits}
          />
        )}

        <div className="space-y-1.5">
          <Label>{t('platform.stores.customPlan.featuresLabel')}</Label>
          <Textarea
            value={form.features}
            onChange={(e) =>
              setForm((f) => ({ ...f, features: e.target.value }))
            }
            placeholder={t('platform.stores.customPlan.featuresPlaceholder')}
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('platform.stores.customPlan.priceMonthlyLabel')}</Label>
            <PriceInput
              value={form.price_monthly_toman}
              onChange={(raw) =>
                setForm((f) => ({ ...f, price_monthly_toman: raw }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('platform.stores.customPlan.priceYearlyLabel')}</Label>
            <PriceInput
              value={form.price_yearly_toman}
              onChange={(raw) =>
                setForm((f) => ({ ...f, price_yearly_toman: raw }))
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('platform.stores.customPlan.priceHint')}
        </p>

        <div className="space-y-1.5">
          <Label>{t('platform.stores.customPlan.noteLabel')}</Label>
          <Textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder={t('platform.stores.customPlan.notePlaceholder')}
            rows={3}
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border p-3">
          <Switch
            checked={form.margin_override}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, margin_override: v }))
            }
          />
          <div>
            <p className="text-sm font-medium">
              {t('platform.stores.customPlan.marginOverride')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('platform.stores.customPlan.marginOverrideHint')}
            </p>
          </div>
        </label>

        <div className="flex items-center justify-between border-t pt-4">
          {isEnabled ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setIsClearConfirmOpen(true)}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {t('platform.stores.customPlan.clear')}
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
            {isSaving ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="me-2 h-4 w-4" />
            )}
            {isSaving
              ? t('platform.stores.customPlan.saving')
              : t('platform.stores.customPlan.save')}
          </Button>
        </div>
      </div>

      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('platform.stores.customPlan.clearConfirmTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('platform.stores.customPlan.clearConfirmDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClearConfirmOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isClearing}
            >
              {isClearing && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isClearing
                ? t('platform.stores.customPlan.clearing')
                : t('platform.stores.customPlan.clear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
