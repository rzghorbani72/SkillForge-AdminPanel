'use client';

import { useEffect, useState } from 'react';
import { Plus, Percent, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';

const COUPON_TYPES = [
  'PERCENT',
  'FIXED',
  'FREE_TRIAL',
  'FULL_DISCOUNT'
] as const;
const USAGE_TYPES = ['UNLIMITED', 'LIMITED', 'ONE_TIME'] as const;

const couponSchema = z.object({
  code: z.string().min(1),
  coupon_type: z.enum(COUPON_TYPES),
  discount_value: z.coerce.number().min(0).optional(),
  free_trial_days: z.coerce.number().int().min(1).optional(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  usage_type: z.enum(USAGE_TYPES),
  usage_limit: z.coerce.number().int().min(1).optional(),
  academy_id: z.coerce.number().min(1),
  max_discount_amount: z.coerce.number().optional(),
  min_purchase_amount: z.coerce.number().optional()
});
type CouponValues = z.infer<typeof couponSchema>;

const TYPE_BADGE_MAP: Record<string, string> = {
  PERCENT: 'percent',
  FIXED: 'fixed',
  FREE_TRIAL: 'free_trial',
  FULL_DISCOUNT: 'full_discount'
};

export default function CouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<CouponValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      coupon_type: 'PERCENT',
      discount_value: 0,
      start_date: '',
      end_date: '',
      usage_type: 'UNLIMITED',
      academy_id: 0
    }
  });

  const couponType = form.watch('coupon_type');
  const usageType = form.watch('usage_type');

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getDiscounts();
      const list =
        (data as any)?.discounts ?? (Array.isArray(data) ? data : []);
      setCoupons(list);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditTarget(null);
    form.reset({
      code: '',
      coupon_type: 'PERCENT',
      discount_value: 0,
      start_date: '',
      end_date: '',
      usage_type: 'UNLIMITED',
      academy_id: 0
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
      academy_id: coupon.academy_id ?? 0,
      max_discount_amount: coupon.max_discount_amount ?? undefined,
      min_purchase_amount: coupon.min_purchase_amount ?? undefined
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: CouponValues) {
    setSaving(true);
    try {
      const payload: any = { ...values, discount_type: values.coupon_type };
      if (editTarget) {
        await apiClient.updateDiscount(editTarget.id, payload);
      } else {
        await apiClient.createDiscount(payload);
      }
      toast.success(t('common.success'));
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
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
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('coupons.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('coupons.description')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('coupons.newCoupon')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('coupons.allCoupons')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Percent className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('coupons.noCoupons')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('coupons.code')}</TableHead>
                  <TableHead>{t('coupons.type')}</TableHead>
                  <TableHead>{t('coupons.value')}</TableHead>
                  <TableHead>{t('coupons.academy')}</TableHead>
                  <TableHead>{t('coupons.uses')}</TableHead>
                  <TableHead>{t('coupons.validity')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {c.code}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          TYPE_BADGE_MAP[c.coupon_type ?? c.discount_type] ??
                          'percent'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {c.coupon_type === 'FREE_TRIAL'
                        ? `${c.free_trial_days ?? 0}d`
                        : c.coupon_type === 'FULL_DISCOUNT'
                          ? '100%'
                          : c.coupon_type === 'PERCENT'
                            ? `${c.discount_value ?? 0}%`
                            : (c.discount_value ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {c.academy?.name ?? c.academy_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      {c.used_count ?? 0}
                      {c.usage_limit ? `/${c.usage_limit}` : ''}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.start_date?.slice(0, 10)} → {c.end_date?.slice(0, 10)}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t('coupons.editCoupon') : t('coupons.createCoupon')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.code')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger aria-label={t('coupons.type')}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUPON_TYPES.map((tt) => (
                            <SelectItem key={tt} value={tt}>
                              {tt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {(couponType === 'PERCENT' || couponType === 'FIXED') && (
                <div className="grid grid-cols-2 gap-4">
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
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('coupons.maxDiscount')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? +e.target.value : undefined
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {couponType === 'FREE_TRIAL' && (
                <FormField
                  control={form.control}
                  name="free_trial_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.freeTrialDays')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.startDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="usage_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('coupons.usageType')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger aria-label={t('coupons.usageType')}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USAGE_TYPES.map((ut) => (
                            <SelectItem key={ut} value={ut}>
                              {ut}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="academy_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('coupons.academyId')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t('common.saving') : t('coupons.saveCoupon')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
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
