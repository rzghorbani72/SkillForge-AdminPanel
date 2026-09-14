'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';
import { apiClient } from '@/lib/api';
import { logger } from '@/lib/logging/app-logger';
import { AcademyCreateModal } from '@/components/academies/AcademyCreateModal';
import { useLegalConsentPending } from '@/components/legal/legal-consent-gate';
import { CreateAcademyBanner } from './create-academy-banner';
import { useCreateFirstAcademy } from './use-create-first-academy';

/**
 * Decides what an academy-less user sees on the dashboard.
 *
 * Only someone who signed up themselves is ever asked to create an academy, and
 * only the first time — afterwards the banner carries the invitation. Anyone a
 * manager created (teacher, or a custom academy role) is never asked: they are
 * waiting to be linked to an academy, not to open one.
 */
export function AcademyOnboarding() {
  const { t } = useTranslation();
  const { academies, isLoading } = useStore();
  const { user } = useAuthUser();
  const { submit } = useCreateFirstAcademy();
  const legalConsentPending = useLegalConsentPending();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogHandled, setDialogHandled] = useState(false);

  const hasNoAcademy = !isLoading && !!user && academies.length === 0;
  const isStaff = isPlatformStaff(user);
  const canOpenAcademy = hasNoAcademy && !isStaff && user?.isSelfRegisteredManager === true;
  // The legal modal wins: while it is open the API is paused anyway, so opening
  // the onboarding dialog would only stack a second modal and burn the one shot.
  const showFirstTimeDialog = canOpenAcademy && !user?.onboardingSeen && !legalConsentPending;

  useEffect(() => {
    if (!showFirstTimeDialog || dialogHandled) return;

    // Marked on show, not on close, so abandoning the tab still counts as the
    // one time we are allowed to interrupt this manager.
    setDialogHandled(true);
    setDialogOpen(true);
    logger.event('Onboarding', 'AcademyDialogShown', {});
    apiClient.markOnboardingSeen().catch(() => {});
  }, [showFirstTimeDialog, dialogHandled]);

  if (isLoading || !user || isStaff || academies.length > 0) return null;

  if (!canOpenAcademy) {
    return <NoAcademyAssignedState t={t} />;
  }

  return (
    <>
      <CreateAcademyBanner onCreate={() => setDialogOpen(true)} t={t} />
      {dialogOpen && !legalConsentPending && (
        <AcademyCreateModal open onClose={() => setDialogOpen(false)} onSubmit={submit} t={t} />
      )}
    </>
  );
}

function NoAcademyAssignedState({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Building2 className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-bold tracking-tight">{t('onboarding.noAcademyTitle')}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {t('onboarding.noAcademyDescription')}
      </p>
    </div>
  );
}
