'use client';

import { InviteLink } from '@/components/class/invite-link';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroup } from '@/types/learning-operations';

/**
 * Join links only work for a published course with a published class.
 * Drafts get a one-line reason instead of a dead URL.
 */
export function ClassInviteBlock({
  joinCode,
  coursePublished,
  classStatus,
}: {
  joinCode: string | null | undefined;
  coursePublished: boolean;
  classStatus: TutoringGroup['status'];
}) {
  const { t } = useTranslation();
  if (!joinCode) return null;

  if (coursePublished && classStatus !== 'DRAFT') {
    return <InviteLink joinCode={joinCode} coursePublished />;
  }

  return (
    <p className="text-xs text-muted-foreground">
      {t(
        coursePublished
          ? 'tutoring.groups.inviteLinkClassDraft'
          : 'tutoring.groups.inviteLinkCourseDraft',
      )}
    </p>
  );
}
