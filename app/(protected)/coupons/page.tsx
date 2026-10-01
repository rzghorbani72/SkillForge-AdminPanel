'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';
import { isPlatformAdmin } from '@/lib/roles';
import { isPlatformMode } from '@/lib/nav-filter';
import { addInputDays, todayInputValue } from '@/lib/i18n/calendar-date';
import { normalizeDiscountCode } from '@/lib/coupons';
import { useCouponCodeAvailability } from '@/hooks/useCouponCodeAvailability';
import { apiErrorMessage } from '@/lib/api-error-message';
import { CouponFormDialog } from './_components/coupon-form-dialog';
import { CouponsTable } from './_components/coupons-table';
import { CouponValues, buildCouponSchema } from './_lib/page-helpers';

export default function CouponsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const formatPercent = usePercentLabel();
  const { user } = useAuthUser();
  const hasStore = useHasStore();
  const platformMode = isPlatformMode(user?.role ?? null, hasStore);
  const isManager = user?.role === 'MANAGER';
  // Platform mode = Mentoma plan vouchers. Academy mode = student checkout codes.
  // useHasStore() is undefined for managers — never gate them on hasStore.
  const canManagePlatformVouchers = isPlatformAdmin(user) && platformMode === true;
  const canManageAcademyCoupons = isManager || (isPlatformAdmin(user) && hasStore === true);
  const canManageCoupons = canManagePlatformVouchers || canManageAcademyCoupons;
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const couponSchema = useMemo(() => buildCouponSchema(t('coupons.endBeforeStart')), [t]);

  const form = useForm<CouponValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      coupon_type: 'PERCENT',
      discount_value: 0,
      start_date: '',
      end_date: '',
      usage_type: 'UNLIMITED',
      academy_id: '',
    },
  });

  const couponType = form.watch('coupon_type');
  const usageType = form.watch('usage_type');
  const watchedCode = form.watch('code');
  const watchedStartDate = form.watch('start_date');
  const watchedEndDate = form.watch('end_date');
  const watchedAcademyId = form.watch('academy_id');

  const clearCodeError = useCallback(() => {
    form.clearErrors('code');
  }, [form]);

  const setCodeTakenError = useCallback(
    (message: string) => {
      form.setError('code', { type: 'manual', message });
    },
    [form],
  );

  useCouponCodeAvailability({
    enabled: dialogOpen,
    code: watchedCode,
    startDate: watchedStartDate,
    endDate: watchedEndDate,
    academyId: watchedAcademyId,
    excludeId: editTarget?.id,
    takenMessage: t('coupons.codeTaken'),
    onAvailable: clearCodeError,
    onTaken: setCodeTakenError,
  });

  const today = todayInputValue();
  const startMinDate = editTarget ? undefined : today;
  const startMaxDate = watchedEndDate ? addInputDays(watchedEndDate, -1) : undefined;
  const endMinDate = watchedStartDate ? (addInputDays(watchedStartDate, 1) ?? today) : today;

  useEffect(() => {
    if (!watchedStartDate || !watchedEndDate) {
      form.clearErrors('end_date');
      return;
    }
    if (watchedStartDate >= watchedEndDate) {
      form.setError('end_date', {
        type: 'manual',
        message: t('coupons.endBeforeStart'),
      });
    } else {
      form.clearErrors('end_date');
    }
  }, [watchedStartDate, watchedEndDate, form, t]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getDiscounts(
        canManagePlatformVouchers ? { academy_id: 'platform', limit: 100 } : { limit: 100 },
      );
      const list = (data as any)?.discounts ?? (Array.isArray(data) ? data : []);
      setCoupons(list);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canManageCoupons) load();
    else setLoading(false);
  }, [canManageCoupons]);

  function openCreate() {
    setEditTarget(null);
    form.reset({
      code: '',
      coupon_type: 'PERCENT',
      discount_value: 0,
      start_date: '',
      end_date: '',
      usage_type: 'UNLIMITED',
      academy_id: '',
    });
    setDialogOpen(true);
  }

  function openEdit(coupon: any) {
    setEditTarget(coupon);
    form.reset({
      code: coupon.code ?? '',
      coupon_type: coupon.coupon_type ?? coupon.discount_type ?? 'PERCENT',
      discount_value: coupon.discount_value ?? 0,
      free_trial_days: coupon.free_trial_days ?? undefined,
      start_date: coupon.start_date?.slice(0, 10) ?? '',
      end_date: coupon.end_date?.slice(0, 10) ?? '',
      usage_type: coupon.usage_type ?? 'UNLIMITED',
      usage_limit: coupon.usage_limit ?? undefined,
      academy_id: coupon.academy_id ?? '',
      max_discount_amount: coupon.max_discount_amount ?? undefined,
      min_purchase_amount: coupon.min_purchase_amount ?? undefined,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: CouponValues) {
    setSaving(true);
    try {
      const academyId = values.academy_id?.trim();
      const body = {
        coupon_type: values.coupon_type,
        discount_type: values.coupon_type === 'FIXED' ? ('FIXED' as const) : ('PERCENT' as const),
        discount_value: values.discount_value ?? 0,
        free_trial_days: values.free_trial_days,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        usage_type: values.usage_type,
        usage_limit: values.usage_limit,
        max_discount_amount: values.max_discount_amount,
        min_purchase_amount: values.min_purchase_amount,
      };

      if (editTarget) {
        await apiClient.updateDiscount(editTarget.id, body);
      } else {
        await apiClient.createDiscount({
          ...body,
          code: normalizeDiscountCode(values.code),
          ...(academyId ? { academy_id: academyId } : {}),
        });
      }
      toast.success(t('common.success'));
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteDiscount(deleteTarget.id);
      toast.success(t('common.success'));
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    }
  }

  if (!canManageCoupons) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('coupons.title')}</h1>
        <p className="text-muted-foreground">{t('coupons.platformOnly')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {t(canManagePlatformVouchers ? 'coupons.title' : 'coupons.academyTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t(canManagePlatformVouchers ? 'coupons.description' : 'coupons.academyDescription')}
          </p>
        </div>
        <Button onClick={openCreate} className="w-full shrink-0 sm:w-auto">
          <Plus className="me-2 h-4 w-4" />
          {t('coupons.newCoupon')}
        </Button>
      </div>

      <CouponsTable
        canManagePlatformVouchers={canManagePlatformVouchers}
        coupons={coupons}
        formatDate={formatDate}
        formatNumber={formatNumber}
        formatPercent={formatPercent}
        loading={loading}
        openEdit={openEdit}
        setDeleteTarget={setDeleteTarget}
      />

      <CouponFormDialog
        canManagePlatformVouchers={canManagePlatformVouchers}
        couponType={couponType}
        dialogOpen={dialogOpen}
        editTarget={editTarget}
        endMinDate={endMinDate}
        form={form}
        onSubmit={onSubmit}
        saving={saving}
        setDialogOpen={setDialogOpen}
        startMaxDate={startMaxDate}
        startMinDate={startMinDate}
        usageType={usageType}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('coupons.deleteCoupon')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('coupons.confirmDelete', { code: deleteTarget?.code })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
