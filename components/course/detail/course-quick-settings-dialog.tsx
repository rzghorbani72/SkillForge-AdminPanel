'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCourseWorkspace } from './course-workspace-context';

const schema = z.object({
  title: z.string().min(5, 'validation.titleMin5').max(80, 'validation.titleMax80'),
  category_id: z.string().optional(),
  is_featured: z.boolean(),
  is_certificate: z.boolean(),
  certificate_min_percent: z.coerce.number().int().min(0).max(100),
});

type QuickSettingsValues = z.infer<typeof schema>;
type CategoryOption = { id: string; name: string };

function toCategoryOptions(data: unknown): CategoryOption[] {
  const list = Array.isArray(data) ? data : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const { id, name } = record;
    if (typeof id !== 'string' || typeof name !== 'string') return [];
    return [{ id, name }];
  });
}

type CourseQuickSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The small, everyday edits. Anything longer (pricing, cover, description,
 * curriculum) lives on the full editor page, which has its own URL.
 */
export function CourseQuickSettingsDialog({ open, onOpenChange }: CourseQuickSettingsDialogProps) {
  const { t } = useTranslation();
  const { course, refresh } = useCourseWorkspace();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<QuickSettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category_id: undefined,
      is_featured: false,
      is_certificate: false,
      certificate_min_percent: 70,
    },
  });

  useEffect(() => {
    if (!open || !course) return;
    form.reset({
      title: course.title,
      category_id: course.Category?.id,
      is_featured: course.is_featured,
      is_certificate: course.is_certificate,
      certificate_min_percent: course.certificate_min_percent ?? 70,
    });
  }, [open, course, form]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    const load = async () => {
      try {
        setCategories(toCategoryOptions(await apiClient.getCategories()));
      } catch {
        setCategories([]);
      }
    };
    void load();
  }, [open, categories.length]);

  const onSubmit = async (values: QuickSettingsValues) => {
    if (!course) return;
    setSaving(true);
    try {
      await apiClient.updateCourse(course.id, values);
      await refresh();
      toast.success(t('courseDetail.settingsSaved'));
      onOpenChange(false);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t('courseDetail.quickSettings')}</DialogTitle>
          <DialogDescription>{t('courseDetail.quickSettingsDesc')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.courseTitle')}</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.category')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('courses.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <FormLabel>{t('courses.featured')}</FormLabel>
                    <FormDescription>{t('courseDetail.featuredHint')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_certificate"
              render={({ field }) => (
                <FormItem className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel>{t('courseDetail.certificate')}</FormLabel>
                      <FormDescription>{t('certificates.rosterHint')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>

                  {field.value ? (
                    <FormField
                      control={form.control}
                      name="certificate_min_percent"
                      render={({ field: percentField }) => (
                        <FormItem className="grid grid-cols-[1fr_auto] items-center gap-3 border-t pt-3">
                          <div className="space-y-1">
                            <FormLabel>{t('certificates.minPercentLabel')}</FormLabel>
                            <FormDescription>{t('certificates.minPercentHint')}</FormDescription>
                          </div>
                          <FormControl>
                            <NumberInput
                              className="w-24"
                              value={percentField.value}
                              onChange={(raw) => percentField.onChange(Number(raw) || 0)}
                              suffix="٪"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : null}
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('common.saving') : t('common.saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
