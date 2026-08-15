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
};

export const LESSON_TYPE_OPTIONS: LessonTypeOption[] = [
  {
    type: 'VIDEO',
    labelKey: 'courses.lessonTypeVideo',
    Icon: Video,
    badgeClass:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
    chipActiveClass:
      'border-sky-500 bg-sky-500 text-white dark:border-sky-400 dark:bg-sky-500'
  },
  {
    type: 'AUDIO',
    labelKey: 'courses.lessonTypeAudio',
    Icon: Mic,
    badgeClass:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
    chipActiveClass:
      'border-violet-500 bg-violet-500 text-white dark:border-violet-400 dark:bg-violet-500'
  },
  {
    type: 'TEXT',
    labelKey: 'courses.lessonTypeText',
    Icon: FileText,
    badgeClass:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
    chipActiveClass:
      'border-slate-600 bg-slate-600 text-white dark:border-slate-400 dark:bg-slate-500'
  },
  {
    type: 'QUIZ',
    labelKey: 'courses.lessonTypeQuiz',
    Icon: ClipboardList,
    badgeClass:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    chipActiveClass:
      'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-500'
  },
  {
    type: 'ASSIGNMENT',
    labelKey: 'courses.lessonTypeAssignment',
    Icon: ClipboardCheck,
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    chipActiveClass:
      'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-500'
  },
  {
    type: 'LIVE',
    labelKey: 'courses.lessonTypeLive',
    Icon: Radio,
    badgeClass:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
    chipActiveClass:
      'border-rose-500 bg-rose-500 text-white dark:border-rose-400 dark:bg-rose-500'
  }
];

export const LESSON_TYPE_BY_KEY = Object.fromEntries(
  LESSON_TYPE_OPTIONS.map((option) => [option.type, option])
) as Record<LessonType, LessonTypeOption>;
