'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CONTENT_KIND_VALUES,
  MODERATION_POLICY,
  type ContentKind,
  type ModerationPolicyMap,
} from '@/types/compliance';

/**
 * Turning any of these on means nobody sees that content until a human here
 * approves it, so the card states the cost rather than presenting it as a
 * neutral toggle.
 */
export function ModerationDefaultsCard() {
  const { t } = useTranslation();
  const [defaults, setDefaults] = useState<ModerationPolicyMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ContentKind | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDefaults(await apiClient.getModerationDefaults());
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (kind: ContentKind, hold: boolean) => {
    setSaving(kind);
    try {
      const next = await apiClient.updateModerationDefaults({
        [kind]: hold ? MODERATION_POLICY.HOLD_FOR_REVIEW : MODERATION_POLICY.PUBLISH_IMMEDIATELY,
      });
      setDefaults(next);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(null);
    }
  };

  const anyHeld =
    defaults &&
    CONTENT_KIND_VALUES.some((kind) => defaults[kind] === MODERATION_POLICY.HOLD_FOR_REVIEW);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('compliance.moderation.title')}</CardTitle>
        <CardDescription>{t('compliance.moderation.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !defaults ? (
          <div className="space-y-2">
            {CONTENT_KIND_VALUES.map((kind) => (
              <Skeleton key={kind} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            {anyHeld ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{t('compliance.moderation.holdWarning')}</AlertDescription>
              </Alert>
            ) : null}

            {CONTENT_KIND_VALUES.map((kind) => {
              const hold = defaults[kind] === MODERATION_POLICY.HOLD_FOR_REVIEW;
              return (
                <div
                  key={kind}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={`policy-${kind}`}>
                      {t(`compliance.moderation.kind.${kind}`)}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {hold
                        ? t('compliance.moderation.stateHold')
                        : t('compliance.moderation.statePublish')}
                    </p>
                  </div>
                  <Switch
                    id={`policy-${kind}`}
                    checked={hold}
                    disabled={saving === kind}
                    onCheckedChange={(checked) => toggle(kind, checked)}
                  />
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
