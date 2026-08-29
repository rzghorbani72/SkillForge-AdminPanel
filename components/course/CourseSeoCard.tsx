'use client';

import { useState, type KeyboardEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import {
  COURSE_KEYWORD_MAX,
  COURSE_KEYWORDS_MAX,
  COURSE_META_DESCRIPTION_MAX,
  COURSE_META_TITLE_MAX,
  type CourseFormData
} from './schema';

type Props = {
  form: UseFormReturn<CourseFormData>;
};

/**
 * What Google shows for this course. Left empty, the course title and
 * description are used, so the card is optional polish, never a blocker.
 */
export default function CourseSeoCard({ form }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [draft, setDraft] = useState('');

  const keywords = form.watch('keywords') ?? [];

  const addKeyword = (raw: string) => {
    const value = raw.trim().replace(/\s+/g, ' ').slice(0, COURSE_KEYWORD_MAX);
    const isDuplicate = keywords.some(
      (k) => k.toLowerCase() === value.toLowerCase()
    );
    if (!value || isDuplicate || keywords.length >= COURSE_KEYWORDS_MAX) return;
    form.setValue('keywords', [...keywords, value], {
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const removeKeyword = (index: number) => {
    form.setValue(
      'keywords',
      keywords.filter((_, i) => i !== index),
      { shouldDirty: true, shouldTouch: true }
    );
  };

  // Enter or comma commits a keyword; Backspace on an empty box deletes the last.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(draft);
      setDraft('');
      return;
    }
    if (e.key === 'Backspace' && draft === '' && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.seo.title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('courses.seo.description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('courses.seo.metaTitle')}</FormLabel>
              <FormControl>
                <Input
                  maxLength={COURSE_META_TITLE_MAX}
                  placeholder={t('courses.seo.metaTitlePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {t('courses.seo.metaTitleHint')} (
                {formatNumber(field.value?.length || 0)}/
                {formatNumber(COURSE_META_TITLE_MAX)})
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('courses.seo.metaDescription')}</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={COURSE_META_DESCRIPTION_MAX}
                  placeholder={t('courses.seo.metaDescriptionPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {t('courses.seo.metaDescriptionHint')} (
                {formatNumber(field.value?.length || 0)}/
                {formatNumber(COURSE_META_DESCRIPTION_MAX)})
              </p>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel htmlFor="course-keyword-input">
            {t('courses.seo.keywords')}
          </FormLabel>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="gap-1 py-1 pe-1 ps-3"
                >
                  {keyword}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    onClick={() => removeKeyword(index)}
                    aria-label={t('common.remove')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            id="course-keyword-input"
            value={draft}
            maxLength={COURSE_KEYWORD_MAX}
            disabled={keywords.length >= COURSE_KEYWORDS_MAX}
            placeholder={t('courses.seo.keywordsPlaceholder')}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              addKeyword(draft);
              setDraft('');
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('courses.seo.keywordsHint', {
              count: formatNumber(COURSE_KEYWORDS_MAX)
            })}{' '}
            ({formatNumber(keywords.length)}/{formatNumber(COURSE_KEYWORDS_MAX)}
            )
          </p>
        </FormItem>
      </CardContent>
    </Card>
  );
}
