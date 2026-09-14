'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseFormData } from '../schema';
import { CoursePriceFields } from './course-price-fields';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CourseFormData>;
};

/**
 * The course's base price lives on the course record, so it is edited through
 * the course form and stored by the page's Save — this dialog only gives it the
 * same shape as the other selling ways.
 */
export function BasePriceDialog({ open, onOpenChange, form }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('courses.editBasePrice')}</DialogTitle>
          <DialogDescription>{t('courses.basePriceDialogHint')}</DialogDescription>
        </DialogHeader>

        <CoursePriceFields form={form} />

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
