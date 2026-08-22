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
    <div className="space-y-3 border-t px-3 py-3">
      {/* Content: the type chips sit on the section header, the player on the
          start side, and everything measured from that player beside it. */}
      <section className="space-y-3 rounded-md border bg-background p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('courses.lessonSectionContent')}
          </p>
          <div
            className="flex flex-wrap gap-1.5"
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
                      'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                      selected
                        ? chipActiveClass
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t(labelKey)}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="w-full sm:w-[calc(50%-0.5rem)]">
            {lesson.lesson_type === 'LIVE' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t(LESSON_TYPE_BY_KEY.LIVE.labelKey)}
                </Label>
                <p
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-lg border border-dashed border-rose-200 bg-rose-50/60 px-4 text-center text-xs leading-snug text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
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

          <div className="grid min-w-[13rem] flex-1 gap-3 sm:grid-cols-2">
            {hasTimedMedia(lesson) && <LessonDurationInfo lesson={lesson} />}

            {seasons.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">{t('courses.season')}</Label>
                <Select
                  value={lesson.seasonClientKey}
                  onValueChange={(value) => onAssign(value)}
                >
                  <SelectTrigger className="h-8 text-sm">
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

            <div className="flex flex-wrap items-center gap-4 rounded-md border border-dashed bg-muted/30 px-3 py-2 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2">
                <Switch
                  checked={lesson.published}
                  onCheckedChange={(v) => onUpdate({ published: v })}
                />
                <span className="text-sm">{t('courses.published')}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Switch
                  checked={lesson.is_free}
                  onCheckedChange={(v) => onUpdate({ is_free: v })}
                />
                <span className="text-sm">{t('courses.freePreview')}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-1 rounded-md border bg-background p-3">
        <div className="flex items-center justify-between gap-2">
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
