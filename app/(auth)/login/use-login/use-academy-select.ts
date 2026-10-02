import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { homeRouteFor, resolveSessionRole } from '@/lib/auth-routing';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { setSelectedAcademyId } from '@/lib/store-utils';
import type { Dispatch, SetStateAction } from 'react';
import type { PendingRedirect } from '@/hooks/use-delayed-redirect';
import { Academy, LoginResponse, goToUnauthorized } from '../_lib/use-login-helpers';

export function useAcademySelect({
  scheduleRedirect,
  planQuery,
}: {
  scheduleRedirect: Dispatch<SetStateAction<PendingRedirect | null>>;
  planQuery: string;
}) {
  const { t } = useTranslation();
  const [academyPickerOpen, setAcademyPickerOpen] = useState(false);
  const [availableAcademies, setAvailableAcademies] = useState<Academy[]>([]);
  const [pickingAcademy, setPickingAcademy] = useState(false);

  async function handleAcademySelect(academyId: string) {
    setPickingAcademy(true);
    try {
      // Every login path has created a session by now, so picking an academy switches.
      apiClient.resumeRequests();
      const switched = (await apiClient.switchAcademy(academyId)) as {
        data?: LoginResponse & { data?: LoginResponse };
      };
      setSelectedAcademyId(academyId);
      toast.success(t('success.loginSuccess'), { toastId: 'login-success' });

      // Someone who just picked an academy is academy staff by definition, so
      // an unreadable response falls back to the dashboard — never to
      // /unauthorized, and never to no redirect at all.
      const session = switched?.data?.data ?? switched?.data ?? {};
      scheduleRedirect({
        href: homeRouteFor(resolveSessionRole(session), { planQuery }) ?? '/dashboard',
        title: t('success.loginSuccess'),
        message: t('auth.redirectingToDashboard'),
      });
    } catch (error: unknown) {
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      toast.error(apiErrorMessage(error, t('error.authenticationFailed')), {
        toastId: 'login-error',
      });
    } finally {
      setPickingAcademy(false);
    }
  }

  return {
    academyPickerOpen,
    availableAcademies,
    pickingAcademy,
    handleAcademySelect,
    showAcademyPicker: (academies: Academy[]) => {
      setAvailableAcademies(academies);
      setAcademyPickerOpen(true);
    },
    closeAcademyPicker: () => setAcademyPickerOpen(false),
  };
}
