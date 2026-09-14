# Course builder wizard

Builds one **recorded (OFFLINE)** course in five steps. A live course is run
from its timetable, so `/courses/[id]/edit` keeps the old single-page form for
`course_type === 'LIVE'`.

## The steps

| #   | Step      | What it writes                                              |
| --- | --------- | ----------------------------------------------------------- |
| 1   | `basics`  | title, description, what you will learn, course type, cover |
| 2   | `content` | category, sections, lessons (video + attached file)         |
| 3   | `access`  | public vs invited-only, plus per-student/group grants       |
| 4   | `pricing` | base price and every other way to enrol                     |
| 5   | `preview` | nothing — the student's view of the unsaved draft           |

## Data flow

- **Create** (`course-create-wizard.tsx`) runs step 1 alone, because content,
  access and pricing all need a saved course to attach to. It creates the draft
  row and continues at `/courses/{id}/edit?step=content` — one flow, two pages.
- **Edit** (`course-wizard.tsx`) drives every step from a single
  `useCourseForm(courseId)`: the same autosave and the same atomic save the old
  page used, so stepping back and forth never loses work.
- **Publishing is not a side effect.** The public/private choice is held in the
  wizard's own state (`visibility`) and written into the form only by the final
  **Save course** button, so autosave can never publish a course mid-edit.
- Access grants chosen in step 3 are staged and applied by that same final save
  (`applyAccessSelection`), after the course itself is stored.

The wizard renders **inside** the course workspace layout, so its three tabs
stay reachable from every step:

| Tab                  | Route                        | Holds                                                 |
| -------------------- | ---------------------------- | ----------------------------------------------------- |
| Course steps         | `/courses/{id}/edit`         | this wizard                                           |
| Financial statistics | `/courses/{id}`              | students, revenue, enrollments, course facts          |
| Certificates         | `/courses/{id}/certificates` | certificate details (only when the course awards one) |

The financial tab used to be the "Overview" and carried a curriculum preview and
the access box; both now live in wizard steps 2 and 3, so it shows money and
enrolment numbers only.
