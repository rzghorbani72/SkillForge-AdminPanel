'use client';

import { useParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CharacterCounter } from '@/components/ui/character-counter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { LESSON_DESCRIPTION_MAX } from '@/components/lesson/schema';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import {
  DEFAULT_DURATION,
  clearIncompatibleMedia,
  hasTimedMedia,
  isTimedLessonType,
} from './course-drafts';
import { LessonMedia, LESSON_INFO_SLOT_CLASS } from './LessonMedia';
import { LESSON_TYPE_BY_KEY, LESSON_TYPE_OPTIONS } from './lesson-type-config';
import { LessonDurationInfo } from './lesson-duration-info';
import { LessonAssessmentDialog } from './lesson-assessment-dialog';

/**
 * Switching type drops the media the old type owned, so a length measured from
 * that media would keep claiming a file the lesson no longer has.
 */
function patchForType(lesson: LessonDraft, type: LessonDraft['lesson_type']): Partial<LessonDraft> {
  const losesItsLength = isTimedLessonType(lesson.lesson_type) && type !== lesson.lesson_type;
  return {
    lesson_type: type,
    ...clearIncompatibleMedia(type),
    ...(losesItsLength ? { duration: DEFAULT_DURATION } : {}),
  };
}

const SETTING_ROW_CLASS = 'flex items-center justify-between gap-3 px-4 py-3';

/** Media (video + cover) takes the wide column; settings fit in the rest. */
const LESSON_MEDIA_COLUMN_CLASS = 'w-full lg:w-[calc(70%-0.625rem)]';
const LESSON_SETTINGS_COLUMN_CLASS = 'w-full lg:w-[calc(30%-0.625rem)]';

interface LessonEditorPanelProps {
  lesson: LessonDraft;
  seasons: SeasonDraft[];
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onAssign: (seasonClientKey: string) => void;
}

export function LessonEditorPanel({ lesson, seasons, onUpdate, onAssign }: LessonEditorPanelProps) {
  const { t } = useTranslation();
  const { course_id: courseId } = useParams<{ course_id: string }>();
  // Live times and the download rule need a screen each, so an unsaved
  // lesson has nowhere to link to yet.
  const settingsHref = lesson.id && courseId ? `/courses/${courseId}/lessons/${lesson.id}` : null;

  // Live teaching is a live course with its own timetable, so a recorded
  // course can no longer make a live lesson; ones that exist stay editable.
  const typeOptions = LESSON_TYPE_OPTIONS.filter(
    (option) => option.type !== 'LIVE' || lesson.lesson_type === 'LIVE',
  );

  return (
    <div className="space-y-4 border-t bg-muted/20 px-4 py-4">
      {/* Content: type chips on the section header, the player on the start
          side, and everything that describes that player beside it. */}
      <section className="space-y-4 rounded-lg border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('courses.lessonSectionContent')}
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={t('courses.lessonType')}
          >
            {typeOptions.map(({ type, labelKey, Icon, chipActiveClass }) => {
              const selected = lesson.lesson_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onUpdate(patchForType(lesson, type))}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                    selected
                      ? chipActiveClass
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-5">
          <div className={LESSON_MEDIA_COLUMN_CLASS}>
            {lesson.lesson_type === 'LIVE' ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t(LESSON_TYPE_BY_KEY.LIVE.labelKey)}
                </Label>
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-200 bg-rose-50/60 px-4 text-center text-xs leading-snug text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
                    LESSON_INFO_SLOT_CLASS,
                  )}
                >
                  {settingsHref ? (
                    <>
                      <p>{t('courses.liveScheduleHint')}</p>
                      <Link
                        href={settingsHref}
                        className="inline-flex items-center gap-1 font-medium underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t('courses.liveScheduleLink')}
                      </Link>
                    </>
                  ) : (
                    <p>{t('courses.liveSaveFirst')}</p>
                  )}
                </div>
              </div>
            ) : (
              <LessonMedia lesson={lesson} onUpdate={onUpdate} />
            )}
          </div>

          {/* One list of "label → value" rows, stretched to whatever height the
              media column takes so the two columns end level. */}
          <div className={cn(LESSON_SETTINGS_COLUMN_CLASS, 'flex flex-col gap-2')}>
            <Label className="min-h-8 text-xs font-medium leading-5 text-muted-foreground">
              {t('courses.lessonSectionSettings')}
            </Label>
            <div className="flex min-h-0 flex-1 flex-col divide-y rounded-lg border bg-muted/20 [&>*]:flex-1">
              {hasTimedMedia(lesson) && <LessonDurationInfo lesson={lesson} />}

              {seasons.length > 0 && (
                <div className={SETTING_ROW_CLASS}>
                  <span className="text-sm text-muted-foreground">{t('courses.season')}</span>
                  <Select value={lesson.seasonClientKey} onValueChange={(value) => onAssign(value)}>
                    <SelectTrigger className="h-9 w-[11rem] bg-background text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s, i) => (
                        <SelectItem key={s.clientKey} value={s.clientKey}>
                          {s.title || t('courses.seasonNumber', { n: i + 1 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className={cn(SETTING_ROW_CLASS, 'cursor-pointer')}>
                <span className="text-sm">{t('courses.published')}</span>
                <Switch
                  checked={lesson.published}
                  onCheckedChange={(v) => onUpdate({ published: v })}
                />
              </label>

              <label className={cn(SETTING_ROW_CLASS, 'cursor-pointer')}>
                <span className="text-sm">{t('courses.freePreview')}</span>
                <Switch
                  checked={lesson.is_free}
                  onCheckedChange={(v) => onUpdate({ is_free: v })}
                />
              </label>

              {/* Keeping the original file for students to save costs the
                  academy roughly double the storage for this lesson, so say so
                  rather than let it show up as a full quota later. */}
              <label className={cn(SETTING_ROW_CLASS, 'cursor-pointer')}>
                <span className="flex flex-col gap-0.5 pe-2">
                  <span className="text-sm">{t('courses.allowDownload')}</span>
                  <span className="text-[11px] leading-snug text-muted-foreground">
                    {t('courses.allowDownloadHint')}
                  </span>
                </span>
                <Switch
                  checked={lesson.allow_download ?? false}
                  onCheckedChange={(v) =>
                    onUpdate({ allow_download: v, allowDownloadTouched: true })
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('courses.lessonSectionDetails')}
          </p>
          <CharacterCounter
            length={lesson.description?.length ?? 0}
            maxLength={LESSON_DESCRIPTION_MAX}
            className="text-xs"
          />
        </div>
        {courseId && (
          <LessonAssessmentDialog
            lessonId={lesson.id}
            courseId={courseId}
            lessonTitle={lesson.title}
          />
        )}
        {settingsHref && (
          <Link
            href={settingsHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t('courses.lessonSettingsLink')}
          </Link>
        )}
        <textarea
          value={lesson.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={t('courses.lessonDescription')}
          rows={3}
          maxLength={LESSON_DESCRIPTION_MAX}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </section>
    </div>
  );
}
