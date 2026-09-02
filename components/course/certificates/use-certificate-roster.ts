'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CertificateRoster } from '@/types/learning-operations';

/**
 * The roster is reloaded after every issue rather than patched in place: the
 * server decides who is eligible, and a stale row is how a teacher ends up
 * clicking a button that then refuses.
 */
export function useCertificateRoster(courseId: string) {
  const { t } = useTranslation();
  const [roster, setRoster] = useState<CertificateRoster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyEnrollmentId, setBusyEnrollmentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      setRoster(await apiClient.getCertificateRoster(courseId));
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setRoster(null);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const issue = useCallback(
    async (enrollmentId: string) => {
      setBusyEnrollmentId(enrollmentId);
      try {
        await apiClient.issueCertificate(enrollmentId);
        toast.success(t('certificates.issued'));
        await load();
      } catch (err) {
        ErrorHandler.handleApiError(err);
      } finally {
        setBusyEnrollmentId(null);
      }
    },
    [load, t]
  );

  const revoke = useCallback(
    async (certificateId: string, enrollmentId: string) => {
      setBusyEnrollmentId(enrollmentId);
      try {
        await apiClient.revokeCertificate(certificateId);
        toast.success(t('certificates.revoked'));
        await load();
      } catch (err) {
        ErrorHandler.handleApiError(err);
      } finally {
        setBusyEnrollmentId(null);
      }
    },
    [load, t]
  );

  return { roster, isLoading, busyEnrollmentId, issue, revoke, reload: load };
}
