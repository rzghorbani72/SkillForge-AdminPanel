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
import { ErrorHandler } from '@/lib/error-handler';

type AcademySiteStatusDialogProps = {
  open: boolean;
  academyName: string;
  onClose: () => void;
  /** Reports the new state so the caller can reflect it without waiting for a refetch. */
  onChanged: (disabled: boolean) => void;
  t: (k: string) => string;
};

/**
 * Closing the academy stops new enrollments only: students who already paid keep
 * their access until it expires. The dialog therefore asks for a contact channel
 * (visitors need someone to ask) and an optional auto-reopen date — nothing to
 * acknowledge, because nobody loses what they bought.
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

  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [reopenAt, setReopenAt] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setConfirming(false);
    setReopenAt('');
    apiClient
      .getAcademySiteStatus()
      .then((data) => {
        setStatus(data);
        setContactEmail(data.contact_email ?? '');
        setMessage(data.message ?? '');
      })
      .catch((e: unknown) => {
        setStatus(null);
        ErrorHandler.handleApiError(e);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const activeStudents = status?.open_obligations?.total ?? 0;
  const managerPhone = status?.default_contact_phone ?? '';
  const hasContact = Boolean(contactEmail.trim() || managerPhone);
  const reopenDate = reopenAt ? new Date(reopenAt) : null;
  // Empty means "closed until I reopen it"; a date is only valid if it is ahead.
  const reopenValid =
    !reopenAt ||
    Boolean(
      reopenDate &&
        !Number.isNaN(reopenDate.getTime()) &&
        reopenDate > new Date()
    );

  async function handleDisable() {
    setSaving(true);
    try {
      await apiClient.disableAcademySite({
        disabled_until: reopenAt ? new Date(reopenAt).toISOString() : undefined,
        contact_email: contactEmail.trim() || undefined,
        message: message.trim() || undefined
      });
      onChanged(true);
      onClose();
    } catch (e: unknown) {
      setConfirming(false);
      ErrorHandler.handleApiError(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleEnable() {
    setSaving(true);
    try {
      await apiClient.enableAcademySite();
      onChanged(false);
      onClose();
    } catch (e: unknown) {
      ErrorHandler.handleApiError(e);
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
            {status?.disabled
              ? t('stores.siteStatusTitleEnable')
              : t('stores.siteStatusTitle')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : confirming ? (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-warning/40 bg-warning/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" />
                {t('stores.siteDisableConfirmTitle')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('stores.siteDisableConfirmBody')}
              </p>
              {activeStudents > 0 && (
                <p className="text-xs font-medium text-muted-foreground">
                  {t('stores.siteDisableConfirmAffected')}: {activeStudents}
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

            <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
              <p className="text-xs">{t('stores.siteDisableTimeReserved')}</p>
              {activeStudents > 0 && (
                <p className="text-xs font-medium">
                  {t('stores.siteDisableActiveSubscriptions')}:{' '}
                  {status?.open_obligations?.active_subscriptions ?? 0} ·{' '}
                  {t('stores.siteDisableActiveEnrollments')}:{' '}
                  {status?.open_obligations?.active_enrollments ?? 0}
                </p>
              )}
            </div>

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

            <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
              <div>
                <p className="text-sm font-medium">
                  {t('stores.siteContactSectionTitle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('stores.siteContactSectionHint')}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('stores.siteContactPhone')}
                  </label>
                  <div
                    className="flex h-9 items-center rounded-md border bg-background px-3 text-sm text-muted-foreground"
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
                    className="bg-background"
                    dir="ltr"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('stores.siteContactPhoneHint')}
              </p>
            </div>

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
              disabled={saving || !hasContact || !reopenValid}
              className="w-full"
            >
              {t('stores.siteDisableAction')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
