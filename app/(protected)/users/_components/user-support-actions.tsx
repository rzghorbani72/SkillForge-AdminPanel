'use client';

import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

/** Support one-offs that act on a single user from the detail sheet. */
export function UserSupportActions({ userId }: { userId: string }) {
  const { t } = useTranslation();

  const resetPassword = async () => {
    const newPassword = window.prompt(t('users.enterNewPasswordPrompt'));
    if (!newPassword) return;
    try {
      await apiClient.resetUserPassword(userId, newPassword);
      toast.success(t('users.passwordResetSuccessMsg'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const grantCourse = async () => {
    const courseId = window.prompt(t('users.enterCourseIdPrompt'));
    if (!courseId) return;
    try {
      await apiClient.grantCourseAccess(userId, {
        course_id: Number(courseId)
      });
      toast.success(t('users.courseAccessGranted'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const assignVoucher = async () => {
    const prefix = window.prompt(t('users.voucherPrefixPrompt'), 'SUPPORT');
    const value = window.prompt(t('users.voucherValuePrompt'));
    if (!prefix || !value) return;
    try {
      const result = await apiClient.assignVoucher(userId, {
        code_prefix: prefix,
        discount_type: 'PERCENT',
        discount_value: Number(value)
      });
      toast.success(
        t('users.voucherCreated', { code: result?.code ?? t('common.success') })
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={resetPassword}>
        {t('users.resetPassword')}
      </Button>
      <Button size="sm" variant="outline" onClick={grantCourse}>
        {t('users.grantCourse')}
      </Button>
      <Button size="sm" variant="outline" onClick={assignVoucher}>
        {t('users.assignVoucher')}
      </Button>
    </div>
  );
}
