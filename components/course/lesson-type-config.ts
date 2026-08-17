import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  Mic,
  Radio,
  Video,
  type LucideIcon
} from 'lucide-react';
import type { LessonType } from './course-drafts';

export type LessonTypeOption = {
  type: LessonType;
  labelKey: string;
  Icon: LucideIcon;
  /** Static badge / selected-chip colors — no hover, no button feel. */
  badgeClass: string;
  chipActiveClass: string;
  /** Empty upload tile tint (matches type color). */
  dropzoneClass: string;
  /** Start-edge bar that marks where one lesson block begins. */
  accentClass: string;
};

export const LESSON_TYPE_OPTIONS: LessonTypeOption[] = [
  {
    type: 'VIDEO',
    labelKey: 'courses.lessonTypeVideo',
    Icon: Video,
    badgeClass:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
    chipActiveClass:
      'border-sky-500 bg-sky-500 text-white dark:border-sky-400 dark:bg-sky-500',
    dropzoneClass:
      'border-sky-300/80 bg-sky-50/70 text-sky-700 hover:border-sky-400 hover:bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:border-sky-600',
    accentClass: 'border-s-sky-400 dark:border-s-sky-600'
  },
  {
    type: 'AUDIO',
    labelKey: 'courses.lessonTypeAudio',
    Icon: Mic,
    badgeClass:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
    chipActiveClass:
      'border-violet-500 bg-violet-500 text-white dark:border-violet-400 dark:bg-violet-500',
    dropzoneClass:
      'border-violet-300/80 bg-violet-50/70 text-violet-700 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:border-violet-600',
    accentClass: 'border-s-violet-400 dark:border-s-violet-600'
  },
  {
    type: 'TEXT',
    labelKey: 'courses.lessonTypeText',
    Icon: FileText,
    badgeClass:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    chipActiveClass:
      'border-slate-600 bg-slate-600 text-white dark:border-slate-400 dark:bg-slate-500',
    dropzoneClass:
      'border-slate-300/80 bg-slate-50/70 text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-500',
    accentClass: 'border-s-slate-400 dark:border-s-slate-600'
  },
  {
    type: 'QUIZ',
    labelKey: 'courses.lessonTypeQuiz',
    Icon: ClipboardList,
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    chipActiveClass:
      'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-500',
    dropzoneClass:
      'border-amber-300/80 bg-amber-50/70 text-amber-800 hover:border-amber-400 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:border-amber-600',
    accentClass: 'border-s-amber-400 dark:border-s-amber-600'
  },
  {
    type: 'ASSIGNMENT',
    labelKey: 'courses.lessonTypeAssignment',
    Icon: ClipboardCheck,
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    chipActiveClass:
      'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-500',
    dropzoneClass:
      'border-emerald-300/80 bg-emerald-50/70 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:border-emerald-600',
    accentClass: 'border-s-emerald-400 dark:border-s-emerald-600'
  },
  {
    type: 'LIVE',
    labelKey: 'courses.lessonTypeLive',
    Icon: Radio,
    badgeClass:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
    chipActiveClass:
      'border-rose-500 bg-rose-500 text-white dark:border-rose-400 dark:bg-rose-500',
    dropzoneClass:
      'border-rose-300/80 bg-rose-50/70 text-rose-700 hover:border-rose-400 hover:bg-rose-50 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:border-rose-600',
    accentClass: 'border-s-rose-400 dark:border-s-rose-600'
  }
];

export const LESSON_TYPE_BY_KEY = Object.fromEntries(
  LESSON_TYPE_OPTIONS.map((option) => [option.type, option])
) as Record<LessonType, LessonTypeOption>;
