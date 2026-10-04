'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import { CourseTypePicker } from './course-type-picker';

export function NewCourseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('courses.courseTypeLabel')}</DialogTitle>
        </DialogHeader>
        <CourseTypePicker onChange={(type) => router.push(`/courses/create?type=${type}`)} />
      </DialogContent>
    </Dialog>
  );
}
