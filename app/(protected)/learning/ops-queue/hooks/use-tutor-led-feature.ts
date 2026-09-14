'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/components/providers/user-provider';
import { toast } from 'react-toastify';

export function useTutorLedFeature() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const isManager =
    user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'PLATFORM_OWNER';
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);
  const [checkingFeature, setCheckingFeature] = useState(true);
  const [enablingFeature, setEnablingFeature] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkFeature = async () => {
      try {
        setCheckingFeature(true);
        const features = await apiClient.getCurrentAcademyFeatures();
        if (!cancelled) {
          setFeatureEnabled(features.tutor_led_learning_enabled);
        }
      } catch (error) {
        if (!cancelled) {
          setFeatureEnabled(false);
          ErrorHandler.handleApiError(error);
        }
      } finally {
        if (!cancelled) {
          setCheckingFeature(false);
        }
      }
    };

    void checkFeature();

    return () => {
      cancelled = true;
    };
  }, []);

  const enableLearningFollowUp = useCallback(async () => {
    setEnablingFeature(true);
    try {
      const updated = await apiClient.updateCurrentAcademyFeatures({
        tutor_led_learning_enabled: true,
      });
      setFeatureEnabled(updated.tutor_led_learning_enabled);
      toast.success(t('opsQueue.featureEnabledSuccess'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setEnablingFeature(false);
    }
  }, [t]);

  return {
    featureEnabled,
    checkingFeature,
    enablingFeature,
    isManager,
    enableLearningFollowUp,
  };
}
