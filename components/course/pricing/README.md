# Course pricing block

One card lists **every way this course can be bought**, one tile per way, each
showing the price that way charges. Prices are edited in a dialog, so the page
shows prices that exist instead of a row of empty inputs.

## Where each price is stored

| Tile                                           | Stored on                      | Written by                         |
| ---------------------------------------------- | ------------------------------ | ---------------------------------- |
| Base course price                              | `Course.price/original_price`  | the course form → page Save        |
| Any extra way (one-time / subscription / free) | `Offer.price/compare_at_price` | `useCourseOffers` → immediately    |
| Private 1:1 tutoring                           | `TutoringOffer.price`          | the tutoring page (read-only here) |

The backend mirrors the base price into a default `Offer`
(`source_course_id` set) because checkout reads `Offer` only. That mirrored row
is filtered out of this list so one price is never shown twice.

Tutoring is read-only here on purpose: it needs a tutor, and it is the only
selling way that consumes a plan seat — see
`docs/architecture/course-access-paths.md`.

## Switching a way off, and the last-way rule

Every card can be switched off (not sold) and edited. Extra offers can also be
deleted; the base price cannot, because it lives on the course — switching it off
(`Course.base_price_active`) is the equivalent, and it stays visible so it can
come back.

While the course is **published**, the last active way is locked: the card's
switch and delete are disabled with a reason. The server enforces the same rule
(`assertKeepsSellingWay`), so a stale page cannot get around it.

## Live class vs recorded

`Offer.includes_live` (the switch in the dialog) decides whether that price also
opens the live meeting link. Turn it off to sell the recorded copy cheaper next
to a live cohort. The rule is enforced server-side in
`LessonAccessService.canJoinLive` and in the live-class reminder audience — see
`docs/architecture/course-access-paths.md`.

## Price before discount

`compare_at_price` (offers) and `original_price` (course) are the struck-through
"before discount" figure. Both must be **above** the price actually charged, or
the page would advertise a discount that is not real — checked here for instant
feedback and again in `OffersService` / the course form schema.
