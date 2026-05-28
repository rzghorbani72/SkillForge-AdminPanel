'use client';

import { GripVertical, Play, Plus, Trash2, X, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Section, uid } from './course-modal-types';

interface Step2Props {
  sections: Section[];
  setSections: (s: Section[]) => void;
}

export function Step2Content({ sections, setSections }: Step2Props) {
  const { t } = useTranslation();

  function addSection() {
    setSections([
      ...sections,
      {
        id: uid(),
        title: t('courses.defaultSeasonTitle', { n: sections.length + 1 }),
        lessons: []
      }
    ]);
  }

  function removeSection(id: string) {
    setSections(sections.filter((s) => s.id !== id));
  }

  function updateSectionTitle(id: string, title: string) {
    setSections(sections.map((s) => (s.id === id ? { ...s, title } : s)));
  }

  function addLesson(sectionId: string) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                { id: uid(), title: t('courses.newLesson'), duration: '۱۲:۳۰' }
              ]
            }
          : s
      )
    );
  }

  function removeLesson(sectionId: string, lessonId: string) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );
  }

  function updateLesson(
    sectionId: string,
    lessonId: string,
    field: keyof { title: string; duration: string },
    value: string
  ) {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              )
            }
          : s
      )
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-[12.5px] text-primary">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        {t('courses.contentHint')}
      </div>

      {sections.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 py-10 text-center text-[13px] text-muted-foreground">
          {t('courses.noSeasonsAdded')}
        </div>
      )}

      {sections.map((section) => (
        <div
          key={section.id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50" />
            <input
              aria-label={t('courses.seasonTitle')}
              className="flex-1 bg-transparent text-[13.5px] font-semibold outline-none"
              value={section.title}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            />
            <button
              type="button"
              aria-label={t('courses.removeSeason')}
              onClick={() => removeSection(section.id)}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="border-t border-border/50">
            {section.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5 last:border-0"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40" />
                <Play className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                <input
                  aria-label={t('courses.lessonTitle')}
                  className="flex-1 bg-transparent text-[12.5px] outline-none"
                  value={lesson.title}
                  onChange={(e) =>
                    updateLesson(section.id, lesson.id, 'title', e.target.value)
                  }
                />
                <input
                  aria-label={t('courses.lesson')}
                  className="w-16 rounded border border-border/60 bg-background px-2 py-0.5 text-center text-[11.5px] outline-none"
                  value={lesson.duration}
                  onChange={(e) =>
                    updateLesson(
                      section.id,
                      lesson.id,
                      'duration',
                      e.target.value
                    )
                  }
                />
                <button
                  type="button"
                  aria-label={t('courses.removeLesson')}
                  onClick={() => removeLesson(section.id, lesson.id)}
                  className="rounded p-0.5 text-muted-foreground/50 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLesson(section.id)}
              className="flex w-full items-center gap-1.5 px-4 py-2.5 text-[12.5px] text-primary/70 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('courses.addLesson')}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        {t('courses.addSeason')}
      </button>
    </div>
  );
}
