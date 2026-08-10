'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { isApiResponseError } from '@/lib/api-error';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useTranslation } from '@/lib/i18n/hooks';

const seasonFormSchema = z.object({
  title: z.string().min(3, 'validation.titleMin3'),
  description: z.string().optional(),
  order: z
    .string()
    .min(1, 'validation.orderRequired')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }, 'validation.orderPositiveInteger'),
  course_id: z.string().min(1, 'validation.courseRequired')
});

type SeasonFormData = z.infer<typeof seasonFormSchema>;

interface CreateSeasonDialogProps {
  onSeasonCreated?: () => void;
  courses?: Course[];
  courseId?: string;
}

export default function CreateSeasonDialog({
  onSeasonCreated,
  courses,
  courseId
}: CreateSeasonDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SeasonFormData>({
    resolver: zodResolver(seasonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      order: '1',
      course_id: courseId ?? ''
    }
  });

  const onSubmitHandler = async (data: SeasonFormData) => {
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Create season
      await apiClient.createSeason({
        title: data.title,
        description: data.description || '',
        order: parseInt(data.order),
        course_id: data.course_id
      });

      form.reset();
      setIsOpen(false);
      onSeasonCreated?.();
    } catch (error) {
      console.error('Error creating season:', error);

      // A duplicate ordering needs its own explanation, not the generic
      // conflict text. Matched on the backend's code — this used to match the
      // raw Prisma string 'Unique constraint failed', which should never have
      // reached the browser in the first place.
      if (
        isApiResponseError(error) &&
        error.error.code === 'CONFLICT_DUPLICATE'
      ) {
        ErrorHandler.showError(t('courses.seasonOrderConflict'));
      } else {
        ErrorHandler.handleApiError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="me-2 h-4 w-4" />
          {t('courses.createSeason')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('courses.createNewSeason')}</DialogTitle>
          <DialogDescription>
            {t('courses.createSeasonSubtitle')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!courseId && (
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.course')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('courses.selectCourse')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem
                            key={course.id}
                            value={course.id.toString()}
                          >
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.seasonTitle')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('courses.seasonTitlePlaceholder')}
                      {...field}
                    />
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
                      placeholder={t('courses.seasonOrderPlaceholder')}
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
                    <Textarea
                      placeholder={t('courses.seasonDescriptionPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('courses.seasonDescriptionHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('common.creating') : t('courses.createSeason')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
