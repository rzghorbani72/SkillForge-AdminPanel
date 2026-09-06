'use client';

import Link from 'next/link';
import { Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * A live course has no lesson tree, so the builder says where its classes and
 * timetable actually live instead of leaving the manager to hunt for them.
 */
export function LiveClassroomBanner({ courseId }: { courseId: string }) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <p className="min-w-0 text-sm text-muted-foreground">
        {t('courseDetail.liveSummary')}
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/courses/${courseId}/live`}>
          <Radio className="me-1.5 h-4 w-4" />
          {t('courseDetail.manageClassroom')}
        </Link>
      </Button>
    </div>
  );
}
