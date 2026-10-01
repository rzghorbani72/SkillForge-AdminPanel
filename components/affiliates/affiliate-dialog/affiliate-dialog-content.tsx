'use client';

import { Loader2, CircleCheck, Phone, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type Affiliate, type AddAffiliateForm } from '../types';
import { CopyBtn } from '../copy-btn';
import type { Dispatch, SetStateAction } from 'react';
import { QUICK_RATES } from '../_lib/affiliate-dialog-helpers';
import { UseFormReturn } from 'react-hook-form';

export function AffiliateDialogContent({
  baseUrl,
  checkingPhone,
  commPct,
  customCommission,
  editData,
  form,
  foundUser,
  handleClose,
  handleCopyPassword,
  handleGeneratePassword,
  isEdit,
  passwordCopied,
  refPreview,
  saving,
  sendSms,
  setCustomCommission,
  setPasswordCopied,
  setSendSms,
  submit,
}: {
  baseUrl: string;
  checkingPhone: boolean;
  commPct: number;
  customCommission: boolean;
  editData: Affiliate | undefined;
  form: UseFormReturn<
    {
      affiliate_name: string;
      phone: string;
      commission_pct: number;
      password?: string | undefined;
    },
    any,
    { affiliate_name: string; phone: string; commission_pct: number; password?: string | undefined }
  >;
  foundUser: { name: string } | null;
  handleClose: () => void;
  handleCopyPassword: () => Promise<void>;
  handleGeneratePassword: () => void;
  isEdit: boolean;
  passwordCopied: boolean;
  refPreview: string;
  saving: boolean;
  sendSms: boolean;
  setCustomCommission: Dispatch<SetStateAction<boolean>>;
  setPasswordCopied: Dispatch<SetStateAction<boolean>>;
  setSendSms: Dispatch<SetStateAction<boolean>>;
  submit: (values: AddAffiliateForm) => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <DialogContent className="max-w-md p-0" dir="rtl">
      <DialogHeader className="border-b px-6 py-4">
        <p className="text-xs font-medium text-muted-foreground">
          {isEdit ? t('affiliates.editAffiliate') : t('affiliates.addSubtitle')}
        </p>
        <DialogTitle className="text-lg">
          {isEdit
            ? t('affiliates.editDialogTitle', {
                name: editData?.affiliate_name ?? '',
              })
            : t('affiliates.addDialogTitle')}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
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

            {isEdit && editData?.code ? (
              <div>
                <p className="mb-2 text-sm font-medium">{t('affiliates.fieldCode')}</p>
                <div
                  className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2"
                  dir="ltr"
                >
                  <code className="flex-1 font-mono text-sm tracking-wide">{editData.code}</code>
                  <CopyBtn
                    text={`${baseUrl}?ref=${editData.code}`}
                    label={t('affiliates.copyLink')}
                  />
                </div>
              </div>
            ) : (
              !isEdit && (
                <div>
                  <p className="mb-2 text-sm font-medium">{t('affiliates.fieldCode')}</p>
                  <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      {t('affiliates.codeAutoGenerated')}
                    </p>
                    <p
                      className="mt-1 truncate font-mono text-xs text-muted-foreground/80"
                      dir="ltr"
                    >
                      {refPreview}
                    </p>
                  </div>
                </div>
              )
            )}

            <div>
              <p className="mb-2 text-sm font-medium">{t('affiliates.commissionLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={cn(
                      'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
                      !customCommission && commPct === r
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
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
                      : 'hover:bg-muted',
                  )}
                  onClick={() => {
                    setCustomCommission(true);
                    if (QUICK_RATES.includes(commPct)) {
                      form.setValue('commission_pct', 30);
                    }
                  }}
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
                    onChange={(e) => form.setValue('commission_pct', Number(e.target.value))}
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
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel className="mb-0">{t('affiliates.fieldPassword')}</FormLabel>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Sparkles className="h-3 w-3" />
                        {t('users.generatePassword')}
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative" dir="ltr">
                        <Input
                          type="text"
                          dir="ltr"
                          className="pe-9 font-mono"
                          placeholder="حداقل ۶ کاراکتر"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordCopied(false);
                          }}
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              void handleCopyPassword();
                            }}
                            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            title={t('affiliates.copy')}
                            aria-label={t('affiliates.copy')}
                          >
                            {passwordCopied ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{t('affiliates.passwordHint')}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!isEdit && (
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t('affiliates.smsToggleTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('affiliates.smsToggleDesc')}</p>
                </div>
                <Switch
                  checked={sendSms}
                  onCheckedChange={setSendSms}
                  aria-label={t('affiliates.smsToggleTitle')}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving || checkingPhone}>
              {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isEdit ? t('affiliates.saveChanges') : t('affiliates.createBtn')}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
