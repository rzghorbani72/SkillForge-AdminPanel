'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SellerIdentity, UpdateSellerIdentityPayload } from '@/types/seller-identity';
import { SellerIdentityForm } from './seller-identity-form';

export function SellerIdentityCard() {
  const { t } = useTranslation();
  const [identity, setIdentity] = useState<SellerIdentity | null>(null);
  const [loading, setLoading] = useState(true);
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
    void load();
  }, [load]);

  const handleSubmit = async (payload: UpdateSellerIdentityPayload) => {
    setSaving(true);
    try {
      const next = await apiClient.updateSellerIdentity(payload);
      setIdentity(next);
      ErrorHandler.showSuccess(
        next.is_complete
          ? t('compliance.sellerIdentity.savedComplete')
          : t('compliance.sellerIdentity.savedIncomplete'),
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{t('compliance.sellerIdentity.title')}</CardTitle>
            <CardDescription>{t('compliance.sellerIdentity.description')}</CardDescription>
          </div>
          {identity ? (
            <Badge variant={identity.is_complete ? 'default' : 'secondary'}>
              {identity.is_complete
                ? t('compliance.sellerIdentity.complete')
                : t('compliance.sellerIdentity.incomplete')}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <SellerIdentityForm identity={identity} saving={saving} onSubmit={handleSubmit} />
        )}
      </CardContent>
    </Card>
  );
}
