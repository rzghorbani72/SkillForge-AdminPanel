'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CourseMultiSelect } from './course-multi-select';
import { Bundle, Course } from './shared';
import type { Dispatch, SetStateAction } from 'react';
import { FormValues } from '../_lib/page-helpers';
import { UseFormReturn } from 'react-hook-form';

export function BundleFormDialog({
  courses,
  dialogOpen,
  editTarget,
  form,
  formatCurrency,
  loadingCourses,
  onSubmit,
  saving,
  savings,
  selectedCourseIds,
  setDialogOpen,
  setSelectedCourseIds,
}: {
  courses: Course[];
  dialogOpen: boolean;
  editTarget: Bundle | null;
  form: UseFormReturn<
    { title: string; slug: string; price: number; description?: string | undefined },
    any,
    { title: string; slug: string; price: number; description?: string | undefined }
  >;
  formatCurrency: (amount: number, currency?: string) => string;
  loadingCourses: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
  saving: boolean;
  savings: number;
  selectedCourseIds: string[];
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedCourseIds: Dispatch<SetStateAction<string[]>>;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-lg" dir={'rtl'}>
        <DialogHeader>
          <DialogTitle>
            {editTarget ? t('bundles.editBundle') : t('bundles.createBundle')}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('bundles.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bundles.bundleTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('bundles.titlePlaceholder')} {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t('bundles.titleHelp')}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bundles.slug')}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" className="font-mono text-sm" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t('bundles.slugHelp')}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bundles.price')}</FormLabel>
                  <FormControl>
                    <NumberInput
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ''}
                      onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t('bundles.priceHelp')}</p>
                  {savings > 0 && (
                    <p className="text-xs font-medium text-emerald-600">
                      {t('bundles.savings')}: {formatCurrency(savings)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('bundles.selectCourses')}</label>
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading courses…
                </div>
              ) : (
                <CourseMultiSelect
                  courses={courses}
                  selected={selectedCourseIds}
                  onChange={setSelectedCourseIds}
                  t={t}
                  formatCurrency={formatCurrency}
                />
              )}
              <p className="text-xs text-muted-foreground">{t('bundles.coursesHelp')}</p>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={t('bundles.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t('bundles.saveBundle')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
