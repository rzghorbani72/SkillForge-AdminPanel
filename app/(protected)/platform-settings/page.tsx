'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiErrorMessage } from '@/lib/api-error-message';
import { PlatformFeaturesCard } from './_components/platform-features-card';

const settingsSchema = z.object({
  vat_rate_pct: z.coerce.number().min(0).max(100),
  subscription_grace_days: z.coerce.number().int().min(0),
  subscription_reminder_days: z.coerce.number().int().min(0),
  legal_entity_name: z.string().optional(),
  vat_registration_no: z.string().optional(),
  economic_code: z.string().optional(),
  owner_notify_phone: z.string().optional(),
});
type SettingsValues = z.infer<typeof settingsSchema>;

export default function PlatformSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      vat_rate_pct: 0,
      subscription_grace_days: 0,
      subscription_reminder_days: 0,
      legal_entity_name: '',
      vat_registration_no: '',
      economic_code: '',
      owner_notify_phone: '',
    },
  });

  useEffect(() => {
    async function fetch() {
      try {
        const data = await apiClient.getPlatformSettings();
        if (data) {
          form.reset({
            vat_rate_pct: (data.vat_rate ?? 0) * 100,
            subscription_grace_days: data.subscription_grace_days ?? 0,
            subscription_reminder_days: data.subscription_reminder_days ?? 0,
            legal_entity_name: data.legal_entity_name ?? '',
            vat_registration_no: data.vat_registration_no ?? '',
            economic_code: data.economic_code ?? '',
            owner_notify_phone: data.owner_notify_phone ?? '',
          });
        }
      } catch (error) {
        toast.error(apiErrorMessage(error, t('common.error')));
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [form, t]);

  async function onSubmit(values: SettingsValues) {
    setSaving(true);
    try {
      await apiClient.updatePlatformSettings({
        vat_rate: values.vat_rate_pct / 100,
        commission_rate: 0,
        subscription_grace_days: values.subscription_grace_days,
        subscription_reminder_days: values.subscription_reminder_days,
        legal_entity_name: values.legal_entity_name || null,
        vat_registration_no: values.vat_registration_no || null,
        economic_code: values.economic_code || null,
        owner_notify_phone: values.owner_notify_phone || null,
      });
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('platformSettings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('platformSettings.description')}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('platformSettings.financialRates')}</CardTitle>
              <CardDescription>{t('platformSettings.financialRatesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="vat_rate_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.vatRate')}</FormLabel>
                    <FormControl>
                      <NumberInput
                        allowDecimal
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                      />
                    </FormControl>
                    <FormDescription>{t('platformSettings.vatRateHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('platformSettings.subscriptionPolicy')}</CardTitle>
              <CardDescription>{t('platformSettings.subscriptionPolicyDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subscription_grace_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.graceDays')}</FormLabel>
                    <FormControl>
                      <NumberInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                      />
                    </FormControl>
                    <FormDescription>{t('platformSettings.graceDaysHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subscription_reminder_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.reminderDays')}</FormLabel>
                    <FormControl>
                      <NumberInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                      />
                    </FormControl>
                    <FormDescription>{t('platformSettings.reminderDaysHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('platformSettings.ownerAlerts')}</CardTitle>
              <CardDescription>{t('platformSettings.ownerAlertsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="owner_notify_phone"
                render={({ field }) => (
                  <FormItem className="max-w-sm">
                    <FormLabel>{t('platformSettings.ownerNotifyPhone')}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="09121234567"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('platformSettings.ownerNotifyPhoneHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('platformSettings.legalInfo')}</CardTitle>
              <CardDescription>{t('platformSettings.legalInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="legal_entity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.legalEntityName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat_registration_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.vatRegNo')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="economic_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platformSettings.economicCode')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? t('common.saving') : t('platformSettings.saveSettings')}
            </Button>
          </div>
        </form>
      </Form>
      <PlatformFeaturesCard />
    </div>
  );
}
