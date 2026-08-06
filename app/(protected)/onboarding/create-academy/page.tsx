'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { useStore } from '@/hooks/useStore';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { createAcademy, type AcademyCreateInput } from '@/lib/academy-create';
import { AcademyCreateModal } from '@/components/academies/AcademyCreateModal';

export default function CreateAcademyPage() {
  const { t } = useTranslation();
  const { refreshAcademies } = useStore();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const postCreateHref = planParam
    ? `/plans?plan=${encodeURIComponent(planParam)}`
    : '/dashboard';
  const [created, setCreated] = useState(false);

  async function handleSubmit(data: AcademyCreateInput) {
    try {
      const result = await createAcademy(data);
      if (result.id) {
        clearAcademyData();
        setSelectedAcademyId(result.id);
      }
      await refreshAcademies().catch(() => {});
      setCreated(true);
      toast.success(t('auth.academyCreatedTitle'));
      setTimeout(() => {
        window.location.href = postCreateHref;
      }, 1500);
    } catch (err: unknown) {
      // A legal-consent 403 opens its own modal and pauses every call — a second
      // toast here would blame the manager for a form that was never submitted.
      if ((err as { code?: string })?.code === 'LEGAL_CONSENT_REQUIRED') return;
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    }
  }

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="text-2xl font-bold">
            {t('auth.academyCreatedTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {planParam ? t('auth.goingToPlans') : t('auth.goingToDashboard')}
          </p>
        </div>
      </div>
    );
  }

  // The panel shell renders behind the blurred backdrop — the manager sees where
  // they landed, but the only way forward is finishing this form.
  return (
    <AcademyCreateModal
      open
      dismissible={false}
      onClose={() => {}}
      onSubmit={handleSubmit}
      t={t}
    />
  );
}
