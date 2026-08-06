'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { useStore } from '@/hooks/useStore';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { createAcademy, type AcademyCreateInput } from '@/lib/academy-create';
import { AcademyCreateModal } from '@/components/academies/AcademyCreateModal';

export default function CreateAcademyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { academies, isLoading, refreshAcademies } = useStore();
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

  // Dismissibility flips on the academy count, so waiting avoids showing a
  // cancellable dialog to someone who turns out to own nothing.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // The panel shell renders behind the blurred backdrop. Owning nothing means
  // there is no panel to go back to, so only a manager who already has an
  // academy gets a way out of the form.
  return (
    <AcademyCreateModal
      open
      dismissible={academies.length > 0}
      onClose={() => router.push('/academies')}
      onSubmit={handleSubmit}
      t={t}
    />
  );
}
