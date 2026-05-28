'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { Section, PublishStatus } from './course-modal-types';

const PUBLISH_OPTIONS: {
  value: PublishStatus;
  labelKey: string;
  subKey: string;
}[] = [
  { value: 'DRAFT', labelKey: 'courses.draft', subKey: 'courses.draftDesc' },
  {
    value: 'PUBLISHED',
    labelKey: 'courses.published',
    subKey: 'courses.publishedDesc'
  },
  {
    value: 'SCHEDULED',
    labelKey: 'courses.scheduled',
    subKey: 'courses.scheduledDesc'
  }
];

interface Step4Props {
  title: string;
  hasCover: boolean;
  sections: Section[];
  publishStatus: PublishStatus;
  setPublishStatus: (s: PublishStatus) => void;
}

export function Step4Publish({
  title,
  hasCover,
  sections,
  publishStatus,
  setPublishStatus
}: Step4Props) {
  const { t } = useTranslation();
  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);

  const checks = [
    { label: t('courses.basicDetails'), ok: title.length >= 5 },
    { label: t('courses.coverImage'), ok: hasCover },
    { label: t('courses.minOneSeason'), ok: sections.length >= 1 },
    { label: t('courses.minThreeLessons'), ok: totalLessons >= 3 },
    { label: t('courses.pricing'), ok: true }
  ];
  const optional = [{ label: t('courses.previewOneLesson'), optional: true }];

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="space-y-2">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('courses.finalReview')}
        </p>
        {[...checks, ...optional].map((item) => {
          const isOptional = 'optional' in item;
          const ok = isOptional ? false : (item as { ok: boolean }).ok;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[13px]">{item.label}</span>
              {isOptional ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                  {t('common.optional')}
                </span>
              ) : ok ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                  {t('courses.ready')}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  {t('courses.incomplete')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('courses.publishStatus')}
        </p>
        {PUBLISH_OPTIONS.map((opt) => {
          const selected = publishStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPublishStatus(opt.value)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border p-3 text-start transition-all',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'hover:border-primary/30 hover:bg-muted/20'
              )}
            >
              <div>
                <p className="text-[13px] font-semibold">{t(opt.labelKey)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t(opt.subKey)}
                </p>
              </div>
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2',
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40'
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
