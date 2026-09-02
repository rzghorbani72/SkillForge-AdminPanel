'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useClassDetail } from '@/hooks/use-class-detail';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * A class is run from inside its course, so this old address forwards there.
 * Kept so existing links and bookmarks still land on the right page.
 */
export default function TutoringGroupRedirectPage() {
  const { group_id: groupId } = useParams<{ group_id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { group, loading } = useClassDetail(groupId);

  useEffect(() => {
    if (group) {
      router.replace(`/courses/${group.course_id}/live/${group.id}`);
    }
  }, [group, router]);

  return (
    <main className="p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        {loading || group ? t('common.loading') : t('tutoring.groups.notFound')}
      </p>
    </main>
  );
}
