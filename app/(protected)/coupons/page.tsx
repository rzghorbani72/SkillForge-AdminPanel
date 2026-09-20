'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Percent, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { CopyableVoucherCode } from '@/components/coupons/copyable-voucher-code';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useHasStore } from '@/hooks/useHasStore';
import { isPlatformAdmin } from '@/lib/roles';
import { isPlatformMode } from '@/lib/nav-filter';
import { CalendarDatePicker } from '@/components/shared/calendar-date-picker';
import { addInputDays, todayInputValue } from '@/lib/i18n/calendar-date';
import {
  COUPON_TYPES,
  COUPON_TYPE_BADGE,
  COUPON_TYPE_LABEL_KEY,
  USAGE_TYPES,
  USAGE_TYPE_LABEL_KEY,
  COUPON_STATUS_BADGE,
  COUPON_STATUS_LABEL_KEY,
  couponStatusOf,
  couponTypeOf,
  normalizeDiscountCode,
} from '@/lib/coupons';
import { useCouponCodeAvailability } from '@/hooks/useCouponCodeAvailability';
import { apiErrorMessage } from '@/lib/api-error-message';

function buildCouponSchema(endBeforeStartMessage: string) {
  return z
    .object({
      code: z.string().min(1, 'validation.required'),
      coupon_type: z.enum(COUPON_TYPES),
      discount_value: z.coerce.number().min(0).optional(),
      free_trial_days: z.coerce.number().int().min(1).optional(),
      start_date: z.string().min(1, 'validation.required'),
      end_date: z.string().min(1, 'validation.required'),
      usage_type: z.enum(USAGE_TYPES),
      usage_limit: z.coerce.number().int().min(1).optional(),
      academy_id: z.string().optional(),
      max_discount_amount: z.coerce.number().optional(),
      min_purchase_amount: z.coerce.number().optional(),
    })
    .refine((values) => values.coupon_type !== 'FREE_TRIAL' || (values.free_trial_days ?? 0) >= 1, {
      path: ['free_trial_days'],
      message: 'validation.required',
    })
    .refine((values) => values.usage_type !== 'LIMITED' || (values.usage_limit ?? 0) >= 1, {
      path: ['usage_limit'],
      message: 'validation.required',
    })
    .refine(
      (values) => !values.start_date || !values.end_date || values.start_date < values.end_date,
      { path: ['end_date'], message: endBeforeStartMessage },
    );
}

type CouponValues = z.infer<ReturnType<typeof buildCouponSchema>>;

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

      <Card>
        <CardHeader>
          <CardTitle>{t('coupons.allCoupons')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Percent className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">{t('coupons.noCoupons')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('coupons.code')}</TableHead>
                  <TableHead>{t('coupons.type')}</TableHead>
                  <TableHead>{t('coupons.value')}</TableHead>
                  {canManagePlatformVouchers && <TableHead>{t('coupons.academy')}</TableHead>}
                  <TableHead>{t('coupons.uses')}</TableHead>
                  <TableHead>{t('coupons.validity')}</TableHead>
                  <TableHead>{t('coupons.status')}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => {
                  const status = couponStatusOf(c);
                  return (
                    <TableRow key={c.id} className={status === 'active' ? undefined : 'opacity-60'}>
                      <TableCell>
                        <CopyableVoucherCode code={c.code} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={COUPON_TYPE_BADGE[couponTypeOf(c)]}
                          label={t(COUPON_TYPE_LABEL_KEY[couponTypeOf(c)])}
                        />
                      </TableCell>
                      <TableCell>
                        {c.coupon_type === 'FREE_TRIAL'
                          ? t('coupons.daysValue', {
                              count: c.free_trial_days ?? 0,
                            })
                          : c.coupon_type === 'FULL_DISCOUNT'
                            ? formatPercent(100)
                            : c.coupon_type === 'PERCENT'
                              ? formatPercent(c.discount_value ?? 0)
                              : formatNumber(c.discount_value ?? 0)}
                      </TableCell>
                      {canManagePlatformVouchers && (
                        <TableCell>{c.Academy?.name ?? t('coupons.platformScope')}</TableCell>
                      )}
                      <TableCell>
                        {c.usage_limit
                          ? `${formatNumber(c.used_count ?? 0)}/${formatNumber(c.usage_limit)}`
                          : formatNumber(c.used_count ?? 0)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.start_date && c.end_date
                          ? `${formatDate(c.start_date)} → ${formatDate(c.end_date)}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={COUPON_STATUS_BADGE[status]}
                          label={t(COUPON_STATUS_LABEL_KEY[status])}
                        />
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t('coupons.editCoupon') : t('coupons.createCoupon')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.code')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!!editTarget}
                          onChange={(event) =>
                            field.onChange(normalizeDiscountCode(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coupon_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label={t('coupons.type')}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUPON_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(COUPON_TYPE_LABEL_KEY[type])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(couponType === 'PERCENT' || couponType === 'FIXED') && (
                  <>
                    <FormField
                      control={form.control}
                      name="discount_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {couponType === 'PERCENT'
                              ? t('coupons.discountPercent')
                              : t('coupons.fixedAmount')}
                          </FormLabel>
                          <FormControl>
                            <NumberInput
                              name={field.name}
                              ref={field.ref}
                              value={field.value ?? ''}
                              onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                              suffix={couponType === 'FIXED' ? t('common.toman') : undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {couponType === 'PERCENT' && (
                      <FormField
                        control={form.control}
                        name="max_discount_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('coupons.maxDiscount')}</FormLabel>
                            <FormControl>
                              <PriceInput
                                name={field.name}
                                ref={field.ref}
                                value={field.value ?? ''}
                                onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {couponType === 'FREE_TRIAL' && (
                  <FormField
                    control={form.control}
                    name="free_trial_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('coupons.freeTrialDays')}</FormLabel>
                        <FormControl>
                          <NumberInput
                            name={field.name}
                            ref={field.ref}
                            value={field.value ?? ''}
                            onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.startDate')}</FormLabel>
                      <FormControl>
                        <CalendarDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minDate={startMinDate}
                          maxDate={startMaxDate}
                          aria-label={t('coupons.startDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.endDate')}</FormLabel>
                      <FormControl>
                        <CalendarDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          minDate={endMinDate}
                          aria-label={t('coupons.endDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usage_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.usageType')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger aria-label={t('coupons.usageType')}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USAGE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(USAGE_TYPE_LABEL_KEY[type])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {usageType === 'LIMITED' && (
                  <FormField
                    control={form.control}
                    name="usage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('coupons.usageLimit')}</FormLabel>
                        <FormControl>
                          <NumberInput
                            name={field.name}
                            ref={field.ref}
                            value={field.value ?? ''}
                            onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {t(
                  canManagePlatformVouchers
                    ? 'coupons.platformScopeHint'
                    : 'coupons.academyScopeHint',
                )}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    saving || !!form.formState.errors.code || !!form.formState.errors.end_date
                  }
                >
                  {saving ? t('common.saving') : t('coupons.saveCoupon')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
