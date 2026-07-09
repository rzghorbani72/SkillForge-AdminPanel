# Tutor-led learning API status (AdminPanel)

## Wired now

Learning record (staff can query by `profile_id`):

- `GET /learning-record/timeline`
- `GET /learning-record/summary`
- `GET /learning-record/ops/queue` (includes unanswered threads; requires `tutor_led_learning_enabled`)
- `POST /learning-record/ops/intervention-notes`

Tutoring operations (require `tutor_led_learning_enabled` for staff writes/lists):

- `POST /tutoring/offers` (client method ready; UI focuses on engagements/sessions)
- `POST /tutoring/engagements`
- `GET /tutoring/engagements`
- `PATCH /tutoring/lessons/:lessonId/download-policy`
- `POST /tutoring/sessions`
- `PATCH /tutoring/sessions/:id/reschedule`
- `PATCH /tutoring/sessions/:id/cancel`
- `POST /tutoring/sessions/:id/attendance`

Also still used from earlier AdminPanel work:

- `GET /users/:id`
- `GET /enrollments?user_id=:id`
- `GET /assignments` / submissions / grade
- quiz authoring + attempt review + contextual discussion

## AdminPanel surfaces

- Student workspace: summary + timeline + assignments
- `/learning/ops-queue`: intervention queue + intervention notes
- `/tutoring`: create engagement, list engagements, schedule/reschedule/cancel, attendance
- Lesson edit: download-policy switches

## Pilot gate

- Academy flag: `tutor_led_learning_enabled` (default off). See `docs/production/tutor-led-learning-pilot-rollout.md`.

## Remaining gaps

- No dedicated `GET /tutoring/sessions` list endpoint — session actions require a known session id (or the last created session in the UI).
- Offer creation UI is not exposed yet (API client method exists).
- Student profile id must be resolved from `/users/:id` profiles; if the user payload lacks a student profile, learning-record calls cannot be scoped.
- Per-student quiz attempt listing still depends on lesson/quiz context (`/quizzes/:id/attempts`), not a student-wide endpoint.
- Attendance history beyond ops-queue missed classes is not listed as a standalone student feed.
- All responses must remain academy-scoped server-side; tutors should only see students on courses they teach.
