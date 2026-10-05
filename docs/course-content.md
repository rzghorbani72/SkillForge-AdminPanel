# Course content: where each thing is edited

One job, one page. This replaces `CONTENT_MANAGEMENT_SETUP.md` and
`CONTENT_SYSTEM_SUMMARY.md`, which described a `/content` route and a set of
dialogs that no longer exist.

## The course workspace

Everything about one course lives under `/courses/[course_id]`, which keeps a
sticky header and tabs mounted so moving between them feels like staying inside
the course.

| Page                                | What it is for                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `/courses/[id]`                     | Overview: enrolments, money, a read-only look at the content                              |
| `/courses/[id]/seasons`             | **The** curriculum editor — seasons and lessons, drag to reorder                          |
| `/courses/[id]/live`                | Redirects to the course steps (`edit?step=schedule`); classes are added and managed there |
| `/courses/[id]/live/[group_id]`     | One class: roster, timetable, homework, actions                                           |
| `/courses/[id]/lessons/[lesson_id]` | The three lesson settings that need a screen of their own                                 |
| `/courses/[id]/edit`                | The course itself: basics, cover, category, pricing, SEO, access                          |

## Curriculum

`/courses/[id]/seasons` is the only place seasons and lessons are edited. It
holds the whole tree as a draft and saves it in one request
(`PATCH /courses/:id/content`), so reordering a season and renaming a lesson is
one save rather than a request per keystroke. Autosave runs on a debounce and
the Save button forces it.

It calls `useCourseForm(courseId, { curriculumOnly: true })`. That flag matters:
the payload then carries **only** the content tree, so saving a lesson can never
write back — or fail validation on — a course field the page is not showing.
Every course field on the server is optional, and omitted fields are left
untouched.

## Lesson settings

Three things cannot sit inline in a lesson row, because each is a screen:

- **Live meeting time** (`LiveSessionEditor`) — when a `LIVE` lesson meets, with
  its weekly repeat rule
- **Quiz questions** (`QuizBuilder`)
- **Download rule** (`LessonDownloadPolicyEditor`) — who may save the file

They live at `/courses/[id]/lessons/[lesson_id]`, linked from the lesson row.
Everything else about a lesson — title, type, media, cover, season, published,
free preview, description — is edited inline in the curriculum.

## Live classes

See `components/class/README.md`. In short: a live course sells seats in a
`TutoringGroup`, and a class is run from inside its course, not from the
tutoring section.
