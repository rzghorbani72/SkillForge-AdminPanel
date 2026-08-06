'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { courseFormSchema } from './schema';

const quickCreateSchema = courseFormSchema.pick({
  title: true,
  description: true
});

type QuickCreateData = z.infer<typeof quickCreateSchema>;

function extractId(resp: unknown): string | undefined {
  const r = resp as { data?: { data?: { id?: string }; id?: string } };
  return r?.data?.data?.id ?? r?.data?.id;
}

/**
 * Creating a course asks for the least that makes a real row: a name and a
 * short description. Everything else — cover, price, category, curriculum —
 * belongs to the builder, where it can be changed as often as needed.
 */
export default function CourseQuickCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<QuickCreateData>({
    resolver: zodResolver(quickCreateSchema),
    mode: 'onTouched',
    defaultValues: { title: '', description: '' }
  });

  const create = async (data: QuickCreateData) => {
    if (!selectedAcademy) {
      toast.error(t('toasts.selectAcademyFirst'));
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const resp = await apiClient.createCourse({
        title: data.title.trim(),
        description: data.description.trim(),
        primary_price: 0,
        secondary_price: 0,
        published: false
      });
      const id = extractId(resp);
      if (!id) throw new Error('Course creation returned no id');

      toast.success(t('courses.createdDraftToast'));
      router.push(`/courses/${id}/edit`);
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setIsSaving(false);
    }
  };

  if (!selectedAcademy) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">{t('common.noStoreSelected')}</p>
        <Button variant="outline" onClick={() => router.push('/courses')}>
          {t('courses.backToCourses')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6 flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mt-0.5 h-8 w-8 shrink-0"
          onClick={() => router.push('/courses')}
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('courses.createCourse')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('courses.quickCreateHint')}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(create)}
              className="space-y-6"
              noValidate
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.courseTitle')} *</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder={t('courses.enterCourseTitle')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.description')} *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={t('courses.enterDescription')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/courses')}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[180px]"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('courses.creatingCourse')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t('courses.createAndContinue')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
