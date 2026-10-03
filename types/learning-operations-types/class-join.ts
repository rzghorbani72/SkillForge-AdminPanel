/** Tutoring seats used against the plan, and the biggest class the plan allows. */
export interface ClassPlanSeats {
  tutoring_students: { used: number; limit: number };
  class_capacity_limit: number;
}

/** The signed join link for the next meeting; null outside the class window. */
export interface ClassJoinLink {
  meeting_url: string | null;
  link_open: boolean;
}

/** Which room to ask for a join link: a group class or a 1:1 engagement. */
export type ClassJoinTarget = { kind: 'group' | 'engagement'; id: string };
