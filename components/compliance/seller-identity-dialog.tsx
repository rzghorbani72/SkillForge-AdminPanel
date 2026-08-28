'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  SellerIdentity,
  SellerIdentityField,
  UpdateSellerIdentityPayload
} from '@/types/seller-identity';
import { SellerIdentityForm } from './seller-identity-form';

type SellerIdentityDialogProps = {
  open: boolean;
  missing?: readonly SellerIdentityField[];
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void | Promise<void>;
};

export function SellerIdentityDialog({
  open,
  missing = [],
  onOpenChange,
  onComplete
}: SellerIdentityDialogProps) {
  const { t } = useTranslation();
  const [identity, setIdentity] = useState<SellerIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSellerIdentity();
      setIdentity(data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const handleSubmit = async (payload: UpdateSellerIdentityPayload) => {
    setSaving(true);
    try {
      const next = await apiClient.updateSellerIdentity(payload);
      setIdentity(next);
      if (next.is_complete) {
        onOpenChange(false);
        await onComplete?.();
      } else {
        ErrorHandler.showSuccess(
          t('compliance.sellerIdentity.savedIncomplete')
        );
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('compliance.sellerIdentity.dialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('compliance.sellerIdentity.dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <SellerIdentityForm
            identity={identity}
            saving={saving}
            highlightMissing={missing.length > 0 ? missing : identity?.missing}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
