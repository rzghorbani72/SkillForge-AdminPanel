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
}

export interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  is_published: boolean;
  Question: QuizQuestion[];
  _count?: { Attempt: number };
}

export type QuestionPayload =
  | { type: 'MULTIPLE_CHOICE'; prompt: string; points: number; options: OptionDraft[] }
  | { type: 'TRUE_FALSE'; prompt: string; points: number; correct_boolean: boolean }
  | { type: 'SHORT_TEXT'; prompt: string; points: number };
