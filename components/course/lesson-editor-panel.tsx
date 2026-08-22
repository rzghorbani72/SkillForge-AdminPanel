'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CharacterCounter } from '@/components/ui/character-counter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { LESSON_DESCRIPTION_MAX } from '@/components/lesson/schema';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import {
  DEFAULT_DURATION,
  clearIncompatibleMedia,
  hasTimedMedia,
  isTimedLessonType
} from './course-drafts';
import { LessonMedia, LESSON_MEDIA_SLOT_CLASS } from './LessonMedia';
import { LESSON_TYPE_BY_KEY, LESSON_TYPE_OPTIONS } from './lesson-type-config';
import { LessonDurationInfo } from './lesson-duration-info';

/**
 * Switching type drops the media the old type owned, so a length measured from
 * that media would keep claiming a file the lesson no longer has.
 */
function patchForType(
  lesson: LessonDraft,
  type: LessonDraft['lesson_type']
): Partial<LessonDraft> {
  const losesItsLength =
    isTimedLessonType(lesson.lesson_type) && type !== lesson.lesson_type;
  return {
    lesson_type: type,
    ...clearIncompatibleMedia(type),
    ...(losesItsLength ? { duration: DEFAULT_DURATION } : {})
  };
}

const SETTING_ROW_CLASS = 'flex items-center justify-between gap-3 px-4 py-3';

interface LessonEditorPanelProps {
  lesson: LessonDraft;
  seasons: SeasonDraft[];
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onAssign: (seasonClientKey: string) => void;
}

export function LessonEditorPanel({
  lesson,
  seasons,
  onUpdate,
  onAssign
}: LessonEditorPanelProps) {
  const { t } = useTranslation();

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
            {LESSON_TYPE_OPTIONS.map(
              ({ type, labelKey, Icon, chipActiveClass }) => {
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
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(labelKey)}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-5">
          <div className="w-full sm:w-[calc(50%-0.625rem)]">
            {lesson.lesson_type === 'LIVE' ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t(LESSON_TYPE_BY_KEY.LIVE.labelKey)}
                </Label>
                <p
                  className={cn(
                    'flex items-center justify-center rounded-lg border border-dashed border-rose-200 bg-rose-50/60 px-4 text-center text-xs leading-snug text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
                    LESSON_MEDIA_SLOT_CLASS
                  )}
                >
                  {t('courses.liveSaveFirst')}
                </p>
              </div>
            ) : (
              <LessonMedia lesson={lesson} onUpdate={onUpdate} />
            )}
          </div>

          {/* Settings read as one list of "label → value" rows, so they stay
              aligned instead of floating around the player. */}
          <div className="flex min-w-[15rem] flex-1 flex-col space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('courses.lessonSectionSettings')}
            </Label>
            <div className="flex flex-1 flex-col divide-y rounded-lg border bg-muted/20">
              {hasTimedMedia(lesson) && <LessonDurationInfo lesson={lesson} />}

              {seasons.length > 0 && (
                <div className={SETTING_ROW_CLASS}>
                  <span className="text-sm text-muted-foreground">
                    {t('courses.season')}
                  </span>
                  <Select
                    value={lesson.seasonClientKey}
                    onValueChange={(value) => onAssign(value)}
                  >
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
