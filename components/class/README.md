# Live class (cohort) components

Everything that renders **one class of a live course** — a `TutoringGroup` with
its weekly slots, its roster, its meetings and its homework.

## Why this folder exists

The same class used to be edited in two places: the course's live tab showed the
timetable and homework, while `/tutoring/groups/[group_id]` showed the roster and
the actions. Neither page could run a class on its own, so a manager moved
between two navigation trees to do one job.

These components were pulled out of both so there is **one class page**:
`/courses/[course_id]/live/[group_id]`. A class belongs to a course, so it is run
from inside the course workspace and keeps the course header and tabs.
`/tutoring/groups/[group_id]` still resolves — it forwards to the course address
so old links and bookmarks keep working.

## Data flow

| Piece                                     | Source                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Group, roster, actions                    | `useClassDetail` → `GET /tutoring-groups/:id`; every write reloads, so seats and status stay honest |
| Meetings                                  | `useClassSessions` → `GET` class sessions; one copy feeds both the timetable and the homework card  |
| Topics (the syllabus a meeting can cover) | `getCourseTopics(course_id)`                                                                        |

`ClassTimetableCard` renders one `SessionRow` per meeting. A row saves itself and
hands the updated meeting back up, so the list never refetches to show an edit.
Cancelling a class meeting (`CancelSessionDialog`) is different: it creates a
makeup (end of the timetable, or a time the teacher picks) and then marks the
original cancelled, so students get **one** SMS with both times. After that the
timetable reloads, because a new row appeared.

Cancelling the **whole class** (`CancelClassDialog`) shows every enrolled student
first. Cash paid (and spent store credit) becomes academy credit. A teacher grant
or a 0-rial voucher gets no credit — those rows are checked so the teacher can
seat them in another class of the same course. Everyone is texted.

`ClassHomeworkCard` reads two parents — work set for the whole class, and work
attached to a single meeting — because the teacher picks which when creating it.

## Where a class is created

Not here. A class is scheduled on the course's live tab (`ScheduleBuilder`), which
needs a `GROUP` tutoring offer to exist first — there is no seat to sell without a
price. That tab now lists classes as rows (`ClassListCard`) and links here.
