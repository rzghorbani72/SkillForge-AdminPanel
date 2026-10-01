'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { generateSimpleTempPassword } from '@/lib/password-utils';
import { toE164Iran } from '@/lib/phone-utils';
import { Dialog } from '@/components/ui/dialog';

import { type Affiliate, addAffiliateSchema, type AddAffiliateForm } from './types';
import { apiErrorMessage } from '@/lib/api-error-message';
import { AffiliateDialogContent } from './affiliate-dialog/affiliate-dialog-content';

export function AffiliateDialog({
  open,
  onClose,
  onDone,
  baseUrl,
  editData,
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
  const [sendSms, setSendSms] = useState(true);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const form = useForm<AddAffiliateForm>({
    resolver: zodResolver(addAffiliateSchema),
    defaultValues: {
      affiliate_name: editData?.affiliate_name ?? '',
      phone: editData?.affiliate_phone ?? '',
      password: '',
      commission_pct: editData ? Math.round((editData.commission_rate ?? 0.15) * 100) : 15,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        affiliate_name: editData?.affiliate_name ?? '',
        phone: editData?.affiliate_phone ?? '',
        password: isEdit ? '' : generateSimpleTempPassword(),
        commission_pct: editData ? Math.round((editData.commission_rate ?? 0.15) * 100) : 15,
      });
      setFoundUser(null);
      setCustomCommission(false);
      setSendSms(true);
      setPasswordCopied(false);
    }
  }, [open, editData, isEdit, form]);

  const phoneValue = form.watch('phone');
  const commPct = form.watch('commission_pct');

  useEffect(() => {
    if (isEdit) return;
    const lookupPhone = toE164Iran(phoneValue?.trim() ?? '');
    if (!lookupPhone.startsWith('+') || lookupPhone.length < 12) {
      setFoundUser(null);
      return;
    }
    const id = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const result = await apiClient.checkAffiliatePhone(lookupPhone);
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
  }, [phoneValue, isEdit, form]);

  function handleClose() {
    form.reset();
    setFoundUser(null);
    setCustomCommission(false);
    setSendSms(true);
    setPasswordCopied(false);
    onClose();
  }

  function handleGeneratePassword() {
    form.setValue('password', generateSimpleTempPassword());
    setPasswordCopied(false);
  }

  async function handleCopyPassword() {
    const password = form.getValues('password');
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  }

  async function submit(values: AddAffiliateForm) {
    if (isEdit) {
      setSaving(true);
      try {
        await apiClient.updateAffiliate(editData!.id, {
          affiliate_name: values.affiliate_name,
          commission_rate: values.commission_pct / 100,
        });
        toast.success(t('common.success'));
        onDone();
        handleClose();
      } catch (e: unknown) {
        const message = apiErrorMessage(e, t('common.error'));
        toast.error(message);
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
        phone: toE164Iran(values.phone.trim()),
        ...(values.password ? { password: values.password } : {}),
        commission_rate: values.commission_pct / 100,
        send_sms: sendSms,
      });
      const code =
        typeof result === 'object' && result !== null && 'code' in result
          ? String(result.code)
          : '';
      toast.success(
        foundUser
          ? t('affiliates.roleAdded', { name: foundUser.name, code })
          : t('affiliates.createdSuccess', { code }),
      );
      onDone();
      handleClose();
    } catch (e: unknown) {
      const message = apiErrorMessage(e, t('common.error'));
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const refPreview = baseUrl ? `${baseUrl.replace(/^https?:\/\//, '')}?ref=···` : '?ref=···';

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <AffiliateDialogContent
        baseUrl={baseUrl}
        checkingPhone={checkingPhone}
        commPct={commPct}
        customCommission={customCommission}
        editData={editData}
        form={form}
        foundUser={foundUser}
        handleClose={handleClose}
        handleCopyPassword={handleCopyPassword}
        handleGeneratePassword={handleGeneratePassword}
        isEdit={isEdit}
        passwordCopied={passwordCopied}
        refPreview={refPreview}
        saving={saving}
        sendSms={sendSms}
        setCustomCommission={setCustomCommission}
        setPasswordCopied={setPasswordCopied}
        setSendSms={setSendSms}
        submit={submit}
      />
    </Dialog>
  );
}
