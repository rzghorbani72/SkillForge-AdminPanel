type QnAPerson = { id: string; display_name: string | null };

/** A visitor's public question on a course page; answering also publishes it. */
export interface CourseQnA {
  id: string;
  course_id: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_at: string | null;
  created_at: string;
  profile: QnAPerson | null;
  answerer: QnAPerson | null;
}
