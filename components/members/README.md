# Adding people to an academy

## Why this is phone-first

A role belongs to a **person inside one academy**, not to an account. The same
human can be a manager of their own academy, a teacher at academy C, and a
student with us — three `Profile` rows, one `User`.

So the dialog asks for a phone number before anything else. The number
identifies the person; only then do we know whether we are creating an account
or attaching a role to one that already exists.

## The three outcomes of the lookup

`usePersonLookup` calls `GET /users/lookup` and the dialog branches on the
result:

| Result                       | What the dialog shows                                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| Not found                    | Name + email fields; a password is **required**                           |
| Found, not a member here     | Their name, role picker; password is **optional** (they already have one) |
| Found, already a member here | A warning — adding again is blocked; change their role instead            |

## What the lookup deliberately does not tell you

Only whether the person is in **your** academy. Which other academies they
belong to is never returned, so this endpoint cannot be used to map a
competitor's staff. It is also exact-match only — there is no partial phone
search — which keeps it from becoming a way to enumerate the platform's users.

## Roles in the picker

`GET /users/assignable-roles` returns exactly what the server will accept:
roles strictly below the caller's own rank. That is what limits a teacher to
student-rank roles without any client-side rule, and it is re-checked on the
server in `AcademyMemberService.addMember`. Promoting someone **above** that is
a separate, manager-only act: `PATCH /profiles/change-role/:profile_id`.

## The password is always one-time

Whatever password staff type is stored with `must_reset_password`, so the person
must replace it before they get a session. The backend texts them that they were
added, including the password when one was set.
