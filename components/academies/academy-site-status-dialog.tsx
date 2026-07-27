'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Power } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient, type AcademySiteStatusData } from '@/lib/api';

type AcademySiteStatusDialogProps = {
  open: boolean;
  academyName: string;
  onClose: () => void;
  /** Reports the new state so the caller can reflect it without waiting for a refetch. */
  onChanged: (disabled: boolean) => void;
  t: (k: string) => string;
};

/**
 * Turning the public site off is the manager's own kill switch, but students who
 * already paid lose access the moment it flips — so the dialog shows exactly how
 * many are affected and refuses to submit without a contact channel and, when
 * students are affected, an explicit acknowledgement.
 */
export function AcademySiteStatusDialog({
  open,
  academyName,
  onClose,
  onChanged,
  t
}: AcademySiteStatusDialogProps) {
  const [status, setStatus] = useState<AcademySiteStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [reopenAt, setReopenAt] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    setAcknowledged(false);
    setConfirming(false);
    setReopenAt('');
    apiClient
      .getAcademySiteStatus()
      .then((data) => {
        setStatus(data);
        setContactEmail(data.contact_email ?? '');
        setMessage(data.message ?? '');
      })
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [open]);

  const affectedStudents = status?.open_obligations?.total ?? 0;
  const needsAcknowledgement = affectedStudents > 0 && !acknowledged;
  const managerPhone = status?.default_contact_phone ?? '';
  const hasContact = Boolean(contactEmail.trim() || managerPhone);
  const reopenDate = reopenAt ? new Date(reopenAt) : null;
  const reopenValid = Boolean(
    reopenDate && !Number.isNaN(reopenDate.getTime()) && reopenDate > new Date()
  );

  async function handleDisable() {
    setSaving(true);
    setError('');
    try {
      await apiClient.disableAcademySite({
        disabled_until: new Date(reopenAt).toISOString(),
        contact_email: contactEmail.trim() || undefined,
        message: message.trim() || undefined,
        acknowledge_obligations: acknowledged
      });
      onChanged(true);
      onClose();
    } catch (e: unknown) {
      setConfirming(false);
      setError((e as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleEnable() {
    setSaving(true);
    setError('');
    try {
      await apiClient.enableAcademySite();
      onChanged(false);
      onClose();
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px]" dir="rtl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">{academyName}</p>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Power className="h-5 w-5" />
            {t('stores.siteStatusTitle')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : confirming ? (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {t('stores.siteDisableConfirmTitle')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('stores.siteDisableConfirmBody')}
              </p>
              {affectedStudents > 0 && (
                <p className="text-xs font-medium text-destructive">
                  {t('stores.siteDisableConfirmAffected')}: {affectedStudents}
                </p>
              )}
              <p className="text-xs text-muted-foreground" dir="ltr">
                {[managerPhone, contactEmail.trim()]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={saving}
                className="flex-1"
              >
                {saving && (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {t('stores.siteDisableConfirmAction')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirming(false)}
                disabled={saving}
                className="flex-1"
              >
                {t('stores.cancel')}
              </Button>
            </div>
          </div>
        ) : status?.disabled ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t('stores.siteCurrentlyDisabled')}
              {status.disabled_until && (
                <>
                  {' '}
                  {t('stores.siteReopensOn')}{' '}
                  {new Date(status.disabled_until).toLocaleString('fa-IR')}
                </>
              )}
            </p>
            <Button onClick={handleEnable} disabled={saving} className="w-full">
              {saving && (
                <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {t('stores.siteEnableAction')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('stores.siteDisableExplain')}
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.siteReopenAt')}
              </label>
              <Input
                type="datetime-local"
                value={reopenAt}
                onChange={(e) => setReopenAt(e.target.value)}
                dir="ltr"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('stores.siteReopenAtHint')}
              </p>
            </div>

            {affectedStudents > 0 && (
              <div className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {t('stores.siteDisableStudentsWarning')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('stores.siteDisableActiveSubscriptions')}:{' '}
                  {status?.open_obligations?.active_subscriptions ?? 0} ·{' '}
                  {t('stores.siteDisableActiveEnrollments')}:{' '}
                  {status?.open_obligations?.active_enrollments ?? 0}
                </p>
                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  {t('stores.siteDisableAcknowledge')}
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.siteContactPhone')}
                </label>
                <div
                  className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground"
                  dir="ltr"
                >
                  {managerPhone || t('stores.siteContactPhoneMissing')}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.siteContactEmail')}
                </label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@academy.com"
                  dir="ltr"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stores.siteContactPhoneHint')}
            </p>

            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              {t('stores.siteDisableTimeReserved')}
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.siteDisableMessage')}
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('stores.siteDisableMessagePlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              variant="destructive"
              onClick={() => setConfirming(true)}
              disabled={
                saving || !hasContact || !reopenValid || needsAcknowledgement
              }
              className="w-full"
            >
              {t('stores.siteDisableAction')}
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
