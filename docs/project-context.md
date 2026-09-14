# Project Context

> Claude MUST read and apply this context to every architecture, UX, pricing, and feature decision in this repo.

## What We Are Building

We are **not** building a generic LMS. We are building a **premium white-label academy platform** for small and medium academies in MENA.

The goal is **not** to maximize features. The goal is to maximize:

- Academy adoption
- Expansion revenue
- Upgrade conversion
- Operational simplicity

Whenever you make architecture, UX, pricing, or feature recommendations, evaluate them against these goals.

## Product Focus: Academy Operating System

We are building an **Academy Operating System**, not a course creation platform.

Course creation is a necessary capability, not our primary differentiation. We are **not** competing with Teachable on course creation. We compete on **academy operations**.

Our primary customer is the **academy manager**.

When evaluating new features, prioritize in this order:

1. Academy management
2. Teacher management
3. Live teaching workflows
4. Student operations
5. Academy growth

Features focused solely on content creation receive **lower priority** unless they directly improve academy acquisition, retention, or operations.

## v1 Launch Reality (Iran first)

The strategy below is the destination. **v1 ships to the Iran market using what is already built**: PayPing/Zarinpal gateways, IRR/Toman currency, Persian (`fa`) UI. MENA + EUR is **phase 2** and requires a new payment rail (Stripe as live default), currency switch, and localization — do not assume those exist yet.

Consequences for any recommendation:

- v1 charges the Toman prices above through the local rails. EUR cannot be collected on the live rail; a EUR price list is phase 2.
- PayPing has no card-on-file, so "subscription" renewals are **initiated, not auto-charged** — design billing UX around manual renewal until a card-on-file rail exists.
- Plan-tier limits (Starter/Growth/Business) are enforced in code and are market-agnostic. The single source of truth for prices, storage, and caps is
  `Backend/src/common/services/plan-limits.types.ts` (`PLAN_CATALOG`), seeded into `SubscriptionPlan` by `Backend/prisma/plans.seed.ts` and read by `plan-limits.service.ts`.

Assessment Philosophy

The platform is designed for academies that teach, evaluate, and provide feedback.

Assessment is a core workflow.

The MVP must support:

- Quizzes
- Homework assignments
- Teacher feedback
- Student submissions
- Persistent learning discussions

Communication should remain contextual and attached to learning activities.

The platform should not become a general-purpose messaging system.

Discussion should exist within assessments, assignments, and educational workflows.

Learning Record

Student progress is more than scores.

Feedback, submissions, comments, and assessment history are part of the student's learning record and should be stored and accessible over time.

Product Scope

We prioritize:

- Teaching workflows
- Assessment workflows
- Feedback workflows
- Academy operations

We do not prioritize:

- Social features
- Community features
- Generic chat systems
- Slack/Discord replacements

## Business Model (validated — treat as a constraint)

**Subscription only. The platform takes 0% commission on enrollments — student money is remitted to
the academy in full.** Revenue is the plan fee plus optional one-shot capacity add-ons when an academy
exceeds included quota (storage uploads hard-block at 100%; soft overage billing on renewals is retired).

| Plan     | USD anchor | Monthly (Iran) | Quarterly (5% off, floor 500k) | Storage | Traffic / month | Tutoring students | Dedicated templates | Commission |
| -------- | ---------- | -------------- | ------------------------------ | ------- | --------------- | ----------------- | ------------------- | ---------- |
| Starter  | $16        | 3,000,000 T    | 8,500,000 T                    | 30 GB   | 200 GB          | 60                | 1                   | 0%         |
| Growth   | $34        | 6,500,000 T    | 18,500,000 T                   | 100 GB  | 700 GB          | 180               | 3                   | 0%         |
| Business | $58        | 11,000,000 T   | 31,000,000 T                   | 250 GB  | 1,500 GB        | 450               | 10                  | 0%         |

**Delivered traffic, not storage, is the binding cost.** Hamravesh charges ~3,000 T per stored GB but
~1,200 T per delivered GB, and an academy streams many times what it stores — so `monthly_traffic_gb`
is the quota the whole ladder is sized against, and it is the natural upgrade trigger. Every cap is
priced at **100% fill**: an academy that uses everything it bought still costs ≤30% of its plan price.
Delivered video is capped at **1,500 kbps / 720p** (`HLS_MAX_BITRATE_KBPS`), which is what makes those
traffic envelopes affordable — raising it re-prices every tier.

Traffic overage **never interrupts playback** — the bytes are already spent when a student presses
play, and dark-screening a class to punish a manager's overage costs the customer and the student's
term. It surfaces as a panel warning at 80% and a bandwidth pack to buy.

Add-on packs (owner-editable): **storage 50 GB / 700,000 T** for the paid period, **traffic 200 GB /
900,000 T** for the current month.

**Plan prices, every plan limit, and the unit-cost assumptions behind the margin check are all edited
by the platform owner** on `/platform/pricing`. For the three built-in tiers (`starter` / `growth` /
`business`), `plan-limits.types.ts` is the designed catalog: migrations and `prisma/plans.seed.ts`
sync those rows on deploy so fresh envs and catalog revisions land together. Custom tiers the owner
created outside that catalog are never touched by seed. The AdminPanel still shows catalog figures as
input placeholders next to whatever is live.

> Iran v1: published monthly prices are fixed in the catalog (`price_monthly_toman`). Quarterly is **3× monthly × 0.95**, then **floored to 500,000 Toman**, so every tier shows a **5% discount**. Sell as **pay once / fewer renewals**. Yearly prepaid is not offered. Already-paid periods are never repriced.

> The student cap counts **distinct active private-tutoring students**, not public
> learners — see the seat rule below.

**Prices are anchored in USD and published in Toman.** `USD_TO_TOMAN_RATE` (default 190,000) converts
them at seed time — never per request, to keep prices stable instead of drifting with FX moves; renewals
are manual. As of legal v2.1, price/plan changes may take effect at any time at the platform's sole
discretion — a new rate is applied by updating the seed and re-publishing the pricing page, and only
affects future renewals/purchases, never an already-paid period. Toman figures round to the nearest
100,000.

- **There is no free-forever tier.** Every **creator manager** gets **one 14-day trial**, once per person and the same length on every plan — not one per academy. After it ends they must pay. The trial belongs to the person because the plan does: one subscription covers every academy they own.
- Amounts are stored and displayed in **Toman**.
- **Margin rule: system cost must stay ≤30% of plan price (≥70% gross).** This is enforced by
  `plan-economics.spec.ts` and at owner save time via `validatePlanEconomics()` — a price, storage
  quota or student cap that breaks it fails the build or is rejected in the panel.
  Every quota AND student cap is sized against it; the caps matter most, because students drive
  egress, compute and SMS all at once.
- **Registration, public course enrolment, and public subscriptions are UNLIMITED on every plan.**
  The only seat is a **distinct active private-tutoring student** — a student holding a live
  tutor-led engagement (`PENDING` or `ACTIVE`) that is still within its term. See
  `PlanLimitsService.countTutoringStudents` / `assertCanAddTutoringStudent`. We cap tutoring because
  it is the resource that scales with the plan: live teacher time, recurring live-session egress, and
  SMS all move with the tutored-student count, whereas selling a recorded course to a thousand people
  is one predictable, cacheable bandwidth cost — not a seat. A student is counted **once** no matter
  how many tutors or courses they hold.
- **Graduation frees the seat at read time, not on a batch job.** When an engagement passes its
  `ends_at` (semester end) the student is graduated: they immediately lose tutor content access
  (`LessonAccessService`) **and** stop consuming a seat (`countTutoringStudents` filters on
  `ends_at > now`), even before the `tutoring-lifecycle` tick flips the status to `COMPLETED`. The
  cap therefore prices the _live_ teaching relationship, never a historical roster.
- **Egress is the number that decides the model.** Bandwidth is ~3x storage cost at these usage
  levels and every tier breaks above roughly 500 T/GB. Measure it before scaling.
- Upgrade triggers are the **plan limits enforced in code** (teachers, courses, storage GB), not a revenue share.
- After the trial or a lapsed plan (plus grace), the academy goes **read-only** — the manager keeps
  GET access to view, export, and pay; no data is deleted.

The business model is already validated. **Do not redesign pricing unless there is a critical issue.**

## Ideal Customer Profile

Small and medium language schools, exam-prep academies, and tutoring centers with **3–15 teachers**.

- The **buyer** is the academy manager.
- Teachers are **not** the primary buyer.

## Priorities

**Priorities:**

1. Fast validation
2. Revenue
3. Simplicity

**Not priorities:**

- Perfect architecture
- Edge cases
- Enterprise requirements
- Scalability beyond the first 100 academies

## How to Act: Startup Co-Founder

Act as a startup co-founder. Your job is **not** to agree with me. Your job is to:

- Challenge assumptions
- Identify risks
- Identify hidden costs
- Find upgrade triggers
- Find churn risks
- Find monetization opportunities

Do not optimize for elegance. **Optimize for business success.**
