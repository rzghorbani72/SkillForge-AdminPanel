'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { useStore } from '@/hooks/useStore';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { createAcademy, type AcademyCreateInput } from '@/lib/academy-create';
import { logger } from '@/lib/logging/app-logger';

/**
 * Creating the first academy changes every academy-scoped request in the panel,
 * so the new id has to be selected and cached before anything else renders. A
 * full page load is the cheapest way to guarantee that.
 */
export function useCreateFirstAcademy() {
  const { t } = useTranslation();
  const { refreshAcademies } = useStore();
  const [created, setCreated] = useState(false);

  const submit = useCallback(
    async (data: AcademyCreateInput) => {
      try {
        const result = await createAcademy(data);
        if (result.id) {
          clearAcademyData();
          setSelectedAcademyId(result.id);
        }
        await refreshAcademies().catch(() => {});
        setCreated(true);
        logger.ok('Onboarding', 'FirstAcademyCreated', {
          academy_id: result.id ?? '',
        });
        toast.success(t('auth.academyCreatedTitle'));
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } catch (err: unknown) {
        // A legal-consent 403 opens its own modal and pauses every call — a second
        // toast here would blame the manager for a form that was never submitted.
        if ((err as { code?: string })?.code === 'LEGAL_CONSENT_REQUIRED') return;
        toast.error((err as { message?: string })?.message ?? t('common.error'));
      }
    },
    [refreshAcademies, t],
  );

  return { submit, created };
}
