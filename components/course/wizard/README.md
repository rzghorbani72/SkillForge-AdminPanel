# Course builder wizard

Builds one course step by step. `stepsFor(courseType)` picks the steps.

**Recorded (OFFLINE):** `basics` → `content` → `access` → `pricing` → `preview`.

**Live:** `basics` (+ optional topics) → `schedule` → `classType` → `meeting` → `review`.

## Live course (`live/`)

A live course sells one or more classes (each a `TutoringGroup`, e.g. a
morning and an evening group). The three middle steps edit one draft
(`live-class-draft.ts` + `class-schedule-draft.ts`, pure and unit-tested):

- Each class has its own name, start date, weekly days/times, session count
  and registration close. Kind, price, seats and meeting link are shared by
  all classes. A name is required only when there are 2+ classes; a lone
  unnamed class is named after the course.
- All classes are written together, because a class needs a price (a GROUP
  offer) before it can exist. They are saved one by one, and a class created
  before a later one fails keeps its id, so a retry never creates it twice.
- Only an unsaved class can be removed here; a saved one is cancelled from the
  classes page (it may already have paid students).
- Before any class exists, the draft is kept in `localStorage` per course
  (`draft-stash.ts`), so a closed tab loses nothing.
- `review` → **Save as draft** creates/updates the classes only.
  **Publish** saves the classes, publishes the course, then publishes each
  draft class. If none can go on sale (e.g. teacher time clash) the course is
  put back to draft, so students never see a course with nothing to buy.
- The meeting room is created by the server on class publish (`AUTO_JITSI`)
  and handed to students only as a signed, time-boxed link. An own link
  (Skyroom, Meet) is hidden behind the same Join button but cannot be locked —
  the step says so.
- Every step uses the full width; publish/draft live in the step's own
  action row (`publish-actions.tsx`). Both places that describe
  the classes (review, success page) word them through
  `use-live-summary.ts` and `class-review-rows.tsx`, so they never disagree.
- The empty course list (`course-type-entry.tsx`) opens `/courses/create?type=LIVE`
  with the type already picked.
- A class that has started (`CONFIRMED`/`RUNNING`) has its dates locked here;
  they change from the class page so students are notified.
- Registration may stay open after the first session (a warning, with a
  one-click fix); after the last session it is refused, in the UI and on the
  server.

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
