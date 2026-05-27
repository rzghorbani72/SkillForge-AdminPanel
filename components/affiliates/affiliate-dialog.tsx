'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CircleCheck, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  type Affiliate,
  addAffiliateSchema,
  type AddAffiliateForm
} from './types';

const QUICK_RATES = [10, 15, 20, 25];

export function AffiliateDialog({
  open,
  onClose,
  onDone,
  baseUrl,
  editData
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  baseUrl: string;
  editData?: Affiliate;
}) {
  const { t } = useTranslation();
  const isEdit = !!editData;
  const [saving, setSaving] = useState(false);
  const [foundUser, setFoundUser] = useState<{ name: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [customCommission, setCustomCommission] = useState(false);

  const form = useForm<AddAffiliateForm>({
    resolver: zodResolver(addAffiliateSchema),
    defaultValues: {
      affiliate_name: editData?.affiliate_name ?? '',
      phone: editData?.affiliate_phone ?? '',
      code: editData?.code ?? '',
      password: '',
      commission_pct: editData
        ? Math.round((editData.commission_rate ?? 0.15) * 100)
        : 15
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        affiliate_name: editData?.affiliate_name ?? '',
        phone: editData?.affiliate_phone ?? '',
        code: editData?.code ?? '',
        password: '',
        commission_pct: editData
          ? Math.round((editData.commission_rate ?? 0.15) * 100)
          : 15
      });
      setFoundUser(null);
      setCustomCommission(false);
    }
  }, [open, editData]);

  const phoneValue = form.watch('phone');
  const codeValue = form.watch('code') ?? '';
  const commPct = form.watch('commission_pct');

  useEffect(() => {
    if (isEdit) return;
    const phone = phoneValue?.trim();
    if (!phone || phone.length < 7) {
      setFoundUser(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const result = await apiClient.checkAffiliatePhone(phone);
        if (result.exists && result.name) {
          setFoundUser({ name: result.name });
          form.setValue('affiliate_name', result.name);
        } else {
          setFoundUser(null);
        }
      } catch {
        setFoundUser(null);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [phoneValue, isEdit]);

  function handleClose() {
    form.reset();
    setFoundUser(null);
    setCustomCommission(false);
    onClose();
  }

  async function submit(values: AddAffiliateForm) {
    if (isEdit) {
      setSaving(true);
      try {
        await apiClient.updateAffiliate(editData!.id, {
          affiliate_name: values.affiliate_name,
          commission_rate: values.commission_pct / 100
        });
        toast.success(t('common.success'));
        onDone();
        handleClose();
      } catch (e: any) {
        toast.error(e?.message ?? t('common.error'));
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!foundUser && !values.password) {
      form.setError('password', { message: t('affiliates.passwordRequired') });
      return;
    }
    setSaving(true);
    try {
      const result = await apiClient.createAffiliateAccount({
        affiliate_name: values.affiliate_name,
        phone: values.phone,
        ...(values.password ? { password: values.password } : {}),
        commission_rate: values.commission_pct / 100
      });
      const code = (result as any)?.code ?? '';
      toast.success(
        foundUser
          ? t('affiliates.roleAdded', { name: foundUser.name, code })
          : t('affiliates.createdSuccess', { code })
      );
      onDone();
      handleClose();
    } catch (e: any) {
      toast.error(e?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-md p-0" dir="rtl">
        <DialogHeader className="border-b px-6 py-4">
          <p className="text-xs font-medium text-muted-foreground">
            {isEdit
              ? t('affiliates.editAffiliate')
              : t('affiliates.addSubtitle')}
          </p>
          <DialogTitle className="text-lg">
            {isEdit
              ? t('affiliates.editDialogTitle', {
                  name: editData?.affiliate_name ?? ''
                })
              : t('affiliates.addDialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="affiliate_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliates.fieldName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="مثلاً: امیر حسینی" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliates.fieldPhone')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="tel"
                            dir="ltr"
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            disabled={isEdit}
                            {...field}
                          />
                          {checkingPhone && (
                            <Loader2 className="absolute end-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      {!isEdit && foundUser && (
                        <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
                          <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                          {t('affiliates.foundUser', { name: foundUser.name })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliates.fieldCode')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="AMIR2403"
                          dir="ltr"
                          disabled={isEdit}
                          className="pe-40 font-mono"
                          {...field}
                        />
                        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                          /r/<strong>{codeValue || 'AMIR2403'}</strong>
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="mb-2 text-sm font-medium">
                  {t('affiliates.commissionLabel')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={cn(
                        'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                        !customCommission && commPct === r
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => {
                        form.setValue('commission_pct', r);
                        setCustomCommission(false);
                      }}
                    >
                      {r}٪
                    </button>
                  ))}
                  <button
                    type="button"
                    className={cn(
                      'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                      customCommission
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => setCustomCommission(true)}
                  >
                    {t('affiliates.commissionCustom')}
                  </button>
                </div>
                {customCommission && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      aria-label={t('affiliates.commissionLabel')}
                      min={1}
                      max={50}
                      step={1}
                      value={commPct}
                      onChange={(e) =>
                        form.setValue('commission_pct', Number(e.target.value))
                      }
                      className="flex-1 accent-primary"
                    />
                    <span className="w-12 text-center font-mono text-sm font-semibold">
                      {commPct}٪
                    </span>
                  </div>
                )}
              </div>

              {!isEdit && !foundUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliates.fieldPassword')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          dir="ltr"
                          placeholder="حداقل ۶ کاراکتر"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t('affiliates.passwordHint')}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isEdit && (
                <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {t('affiliates.smsToggleTitle')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('affiliates.smsToggleDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t('affiliates.smsToggleTitle')}
                    className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors focus:outline-none"
                    role="switch"
                    aria-checked="true"
                  >
                    <span className="pointer-events-none inline-block h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm ring-0 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving || checkingPhone}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isEdit
                  ? t('affiliates.saveChanges')
                  : t('affiliates.createBtn')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
