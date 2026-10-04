'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SectionCard } from '@/components/shared/section-card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePlatformFeatures } from '@/hooks/use-platform-features';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import type { PlatformFeatures } from '@/lib/api-client/types-1';
import { useTranslation } from '@/lib/i18n/hooks';

const SWITCHES = [
  { key: 'quizzes_enabled', label: 'platformSettings.quizzesEnabled' },
  { key: 'certificates_enabled', label: 'platformSettings.certificatesEnabled' },
] as const satisfies readonly { key: keyof PlatformFeatures; label: string }[];

export function PlatformFeaturesCard() {
  const { t } = useTranslation();
  const features = usePlatformFeatures();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState<keyof PlatformFeatures | null>(null);

  const toggle = async (key: keyof PlatformFeatures, value: boolean) => {
    setSaving(key);
    try {
      await apiClient.updatePlatformSettings({ [key]: value });
      await queryClient.invalidateQueries({ queryKey: ['platform-features'] });
    } catch (e) {
      toast.error(apiErrorMessage(e, t('platformSettings.saveFailed')));
    } finally {
      setSaving(null);
    }
  };

  return (
    <SectionCard
      title={t('platformSettings.featuresTitle')}
      hint={t('platformSettings.featuresHint')}
    >
      {SWITCHES.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <Label htmlFor={key}>{t(label)}</Label>
          <Switch
            id={key}
            checked={features[key]}
            disabled={saving !== null}
            onCheckedChange={(value) => void toggle(key, value)}
          />
        </div>
      ))}
    </SectionCard>
  );
}
