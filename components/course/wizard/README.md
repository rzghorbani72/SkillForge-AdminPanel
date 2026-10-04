# Course builder wizard

Builds one course step by step. `stepsFor(courseType)` picks the steps.

**Recorded (OFFLINE):** `basics` → `content` → `access` → `pricing` → `preview`.

**Live:** `basics` (+ optional topics) → `schedule` → `classType` → `meeting` → `review`.

## Live course (`live/`)

A live course sells one class (a `TutoringGroup`). The three middle steps edit
one draft (`live-class-draft.ts`, pure and unit-tested) that is written as a
unit, because a class needs a price (a GROUP offer) before it can exist:

- Before the class exists, the draft is kept in `localStorage` per course
  (`draft-stash.ts`), so a closed tab loses nothing.
- `review` → **Save as draft** creates/updates the class only.
  **Publish** saves the class, publishes the course, then publishes the class.
  If the class publish fails (e.g. teacher time clash) the course is put back
  to draft, so students never see a course with nothing to buy.
- The meeting room is created by the server on class publish (`AUTO_JITSI`)
  and handed to students only as a signed, time-boxed link. An own link
  (Skyroom, Meet) is hidden behind the same Join button but cannot be locked —
  the step says so.
- Live steps use the full width; only review gets a side panel with the
  publish-vs-draft choice (`live-step-layout.tsx`). Both places that describe
  the class (review, success page) word it through
  `use-live-summary.ts`, so they never disagree.
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
