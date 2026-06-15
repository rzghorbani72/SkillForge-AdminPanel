'use client';

import { UseFormReturn } from 'react-hook-form';
import { WizardValues } from './wizard-schema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Globe, EyeOff, Star, Lock, CalendarClock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface Props {
  form: UseFormReturn<WizardValues>;
  courses: { id: number; title: string }[];
}

export default function WizardStepAccess({ form, courses }: Props) {
  const { t } = useTranslation();
  const isPublished = form.watch('is_published');
  const isFeatured = form.watch('is_featured');

  return (
    <div className="space-y-6">
      {/* Publish toggle */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPublished ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950' : 'bg-muted text-muted-foreground'}`}
            >
              {isPublished ? (
                <Globe className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {t('wizard.publishToggle')}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPublished
                  ? t('wizard.publishedDesc')
                  : t('wizard.draftDesc')}
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t('wizard.publishToggle')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Featured toggle */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${isFeatured ? 'bg-amber-100 text-amber-600 dark:bg-amber-950' : 'bg-muted text-muted-foreground'}`}
            >
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {t('wizard.featuredCourse')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('wizard.featuredDesc')}
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t('wizard.featuredCourse')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Access term (live-class / time-boxed access) */}
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{t('wizard.accessTerm')}</p>
        </div>
        <FormField
          control={form.control}
          name="access_duration_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">
                {t('wizard.accessTerm')}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder={t('wizard.accessTermPlaceholder')}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </FormControl>
              <FormDescription>{t('wizard.accessTermHint')}</FormDescription>
            </FormItem>
          )}
        />
      </div>

      {/* Prerequisite */}
      {courses.length > 0 && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{t('wizard.prerequisite')}</p>
          </div>
          <FormField
            control={form.control}
            name="prerequisite_course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t('wizard.prerequisite')}
                </FormLabel>
                <FormControl>
                  <select
                    aria-label={t('wizard.prerequisite')}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? +e.target.value : null)
                    }
                  >
                    <option value="">{t('wizard.noPrerequisite')}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>
                  {t('wizard.prerequisiteHint')}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
