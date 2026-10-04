'use client';

import { Award } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CERTIFICATE_RULES,
  COURSE_DIFFICULTIES,
  type CourseDifficultyLevel,
  type CourseFormData,
} from './schema';

export const DIFFICULTY_LABEL: Record<CourseDifficultyLevel, string> = {
  BEGINNER: 'courses.beginner',
  INTERMEDIATE: 'courses.intermediate',
  ADVANCED: 'courses.advanced',
  EXPERT: 'courses.expert',
};

export default function CourseFactsCard({
  form,
  hideLevel = false,
}: {
  form: UseFormReturn<CourseFormData>;
  /** The live course step shows the level beside the cover instead. */
  hideLevel?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.publicFacts')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hideLevel ? null : (
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courses.level')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('courses.level')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COURSE_DIFFICULTIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {t(DIFFICULTY_LABEL[level])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t('courses.levelHint')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="access_duration_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('courseDetail.accessDuration')}</FormLabel>
              <FormControl>
                <NumberInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('courses.accessDurationDaysPlaceholder')}
                />
              </FormControl>
              <FormDescription>{t('courses.accessDurationDaysHint')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_certificate"
          render={({ field }) => (
            <FormItem className="flex max-w-md items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <FormLabel className="text-sm font-medium">
                    {t('courseDetail.certificate')}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t('courses.includesCertificateHint')}
                  </p>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('is_certificate') && (
          <FormField
            control={form.control}
            name="certificate_rule"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel>{t('certificates.ruleLabel')}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const rule = CERTIFICATE_RULES.find((option) => option === value);
                    if (rule) field.onChange(rule);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CERTIFICATE_RULES.map((rule) => (
                      <SelectItem key={rule} value={rule}>
                        {t(`certificates.rule.${rule}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t('certificates.ruleHint')}</FormDescription>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
