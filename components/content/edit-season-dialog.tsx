'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { isApiResponseError } from '@/lib/api-error';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Season } from '@/types/api';

const schema = z.object({
  title: z.string().min(3, 'validation.titleMin3'),
  description: z.string().optional(),
  order: z
    .string()
    .min(1, 'validation.orderRequired')
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0;
    }, 'validation.orderPositiveInteger')
});

type EditSeasonValues = z.infer<typeof schema>;

type EditSeasonDialogProps = {
  season: Season;
  onSeasonUpdated: () => void;
};

/** Renaming or reordering a season is a one-field task, so it stays in place. */
export default function EditSeasonDialog({
  season,
  onSeasonUpdated
}: EditSeasonDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditSeasonValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', order: '1' }
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      title: season.title,
      description: season.description ?? '',
      order: String(season.order ?? 1)
    });
  }, [isOpen, season, form]);

  const onSubmit = async (values: EditSeasonValues) => {
    setIsSaving(true);
    try {
      await apiClient.updateSeason(season.id, {
        title: values.title,
        description: values.description ?? '',
        order: Number(values.order)
      });
      toast.success(t('courses.seasonUpdated'));
      setIsOpen(false);
      onSeasonUpdated();
    } catch (error) {
      if (
        isApiResponseError(error) &&
        error.error.code === 'CONFLICT_DUPLICATE'
      ) {
        ErrorHandler.showError(t('courses.seasonOrderConflict'));
      } else {
        ErrorHandler.handleApiError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="me-1 h-4 w-4" />
          {t('courses.editSeason')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('courses.editSeason')}</DialogTitle>
          <DialogDescription>
            {t('courses.editSeasonSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.seasonTitle')} *</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.orderLabel')} *</FormLabel>
                  <FormControl>
                    <NumberInput
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('courses.seasonOrderHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('courses.seasonDescriptionOptional')}
                  </FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
