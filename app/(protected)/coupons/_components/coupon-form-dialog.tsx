'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
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
import { useTranslation } from '@/lib/i18n/hooks';
import { CalendarDatePicker } from '@/components/shared/calendar-date-picker';
import {
  COUPON_TYPES,
  COUPON_TYPE_LABEL_KEY,
  USAGE_TYPES,
  USAGE_TYPE_LABEL_KEY,
  normalizeDiscountCode,
} from '@/lib/coupons';
import type { Dispatch, SetStateAction } from 'react';
import { CouponValues } from '../_lib/page-helpers';
import { UseFormReturn } from 'react-hook-form';

export function CouponFormDialog({
  canManagePlatformVouchers,
  couponType,
  dialogOpen,
  editTarget,
  endMinDate,
  form,
  onSubmit,
  saving,
  setDialogOpen,
  startMaxDate,
  startMinDate,
  usageType,
}: {
  canManagePlatformVouchers: boolean;
  couponType: 'PERCENT' | 'FIXED' | 'FREE_TRIAL' | 'FULL_DISCOUNT';
  dialogOpen: boolean;
  editTarget: any;
  endMinDate: string;
  form: UseFormReturn<
    {
      code: string;
      coupon_type: 'PERCENT' | 'FIXED' | 'FREE_TRIAL' | 'FULL_DISCOUNT';
      start_date: string;
      end_date: string;
      usage_type: 'UNLIMITED' | 'LIMITED' | 'ONE_TIME';
      discount_value?: number | undefined;
      free_trial_days?: number | undefined;
      usage_limit?: number | undefined;
      academy_id?: string | undefined;
      max_discount_amount?: number | undefined;
      min_purchase_amount?: number | undefined;
    },
    any,
    {
      code: string;
      coupon_type: 'PERCENT' | 'FIXED' | 'FREE_TRIAL' | 'FULL_DISCOUNT';
      start_date: string;
      end_date: string;
      usage_type: 'UNLIMITED' | 'LIMITED' | 'ONE_TIME';
      discount_value?: number | undefined;
      free_trial_days?: number | undefined;
      usage_limit?: number | undefined;
      academy_id?: string | undefined;
      max_discount_amount?: number | undefined;
      min_purchase_amount?: number | undefined;
    }
  >;
  onSubmit: (values: CouponValues) => Promise<void>;
  saving: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  startMaxDate: string | undefined;
  startMinDate: string | undefined;
  usageType: 'UNLIMITED' | 'LIMITED' | 'ONE_TIME';
}) {
  const { t } = useTranslation();
  return (
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
  );
}
