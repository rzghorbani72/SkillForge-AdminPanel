export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT';

export interface OptionDraft {
  text: string;
  is_correct: boolean;
}

export interface QuizOption extends OptionDraft {
  id: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  order: number;
  correct_boolean?: boolean | null;
  Option: QuizOption[];
  /** Answered questions are frozen so past results never change. */
  _count?: { Answer: number };
}

/** Rules a teacher can change at any time; they apply to the next attempts. */
export interface QuizSettings {
  pass_percent: number;
  /** Random draw size from the bank; null = every question. */
  questions_per_attempt: number | null;
  /** null = unlimited retakes. */
  max_attempts: number | null;
  is_required: boolean;
  is_final: boolean;
}

export interface Quiz extends QuizSettings {
  id: string;
  title: string;
  description?: string | null;
  is_published: boolean;
  lesson_id: string | null;
  tutoring_session_id: string | null;
  Question: QuizQuestion[];
  _count?: { Attempt: number };
}

/** Where a quiz hangs: a lesson of a course, or one meeting of a live class. */
export type QuizParent = { kind: 'lesson'; id: string } | { kind: 'session'; id: string };

/** New questions are multiple choice only; older types still show and grade. */
export interface QuestionPayload {
  prompt: string;
  points: number;
  options: OptionDraft[];
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  pass_percent: 60,
  questions_per_attempt: null,
  max_attempts: null,
  is_required: false,
  is_final: false,
};
