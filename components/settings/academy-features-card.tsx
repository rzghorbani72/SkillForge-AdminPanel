'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, type AcademyFeatureFlags } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

type FeatureKey = keyof AcademyFeatureFlags;

const FEATURE_KEYS: FeatureKey[] = [
  'enrollment_enabled',
  'subscription_enabled',
  'live_classes_enabled',
  'tutor_led_learning_enabled'
];

const FEATURE_LABELS: Record<
  FeatureKey,
  { title: string; description: string }
> = {
  enrollment_enabled: {
    title: 'settings.enrollmentEnabled',
    description: 'settings.enrollmentEnabledDescription'
  },
  subscription_enabled: {
    title: 'settings.subscriptionEnabled',
    description: 'settings.subscriptionEnabledDescription'
  },
  live_classes_enabled: {
    title: 'settings.liveClassesEnabled',
    description: 'settings.liveClassesEnabledDescription'
  },
  tutor_led_learning_enabled: {
    title: 'settings.tutorLedLearningEnabled',
    description: 'settings.tutorLedLearningEnabledDescription'
  }
};

export function AcademyFeaturesCard() {
  const { t } = useTranslation();
  const [features, setFeatures] = useState<AcademyFeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<FeatureKey | null>(null);

  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCurrentAcademyFeatures();
      setFeatures(data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeatures();
  }, [loadFeatures]);

  const toggleFeature = async (key: FeatureKey, checked: boolean) => {
    if (!features) return;
    const previous = features[key];
    setFeatures({ ...features, [key]: checked });
    setSavingKey(key);
    try {
      const updated = await apiClient.updateCurrentAcademyFeatures({
        [key]: checked
      });
      setFeatures(updated);
      ErrorHandler.showSuccess(t('settings.featuresUpdatedSuccess'));
    } catch (error) {
      setFeatures({ ...features, [key]: previous });
      ErrorHandler.handleApiError(error);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.academyFeaturesTitle')}</CardTitle>
        <CardDescription>
          {t('settings.academyFeaturesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          FEATURE_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <Label htmlFor={key}>{t(FEATURE_LABELS[key].title)}</Label>
                <p className="text-sm text-muted-foreground">
                  {t(FEATURE_LABELS[key].description)}
                </p>
              </div>
              <Switch
                id={key}
                checked={features?.[key] ?? false}
                disabled={savingKey !== null}
                onCheckedChange={(checked) => void toggleFeature(key, checked)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
