# Investor Metrics — Definitions, Sources and Limits

> Every number shown at `/platform/metrics` and in the data-room export is defined here: the formula, the table and column it comes from, what is excluded, and what it cannot yet tell you. If a figure is quoted in a fundraising conversation, its definition is in this file.

Access: `PLATFORM_OWNER`, `ADMIN`, `FINANCE`. `SUPPORT` is excluded.

---

## 1. Ground rules

| Rule                       | Detail                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Storage unit**           | Every amount is stored in **Rial**. `TOMAN_TO_RIAL = 10` (`Backend/src/common/services/plan-limits.types.ts`). Conversion happens once, at the response boundary, in `FxService.convert`.                                                                                                  |
| **Display units**          | **Toman** (default) or **EUR**.                                                                                                                                                                                                                                                            |
| **FX rate**                | `TOMAN_PER_EUR` from configuration, defaulting to `USD_TO_TOMAN_RATE × EUR_USD_RATE` (fallback 1.08). It is **not** a live feed. The rate in force is **stored on every `MetricSnapshot` row**, so a historic EUR figure is reproducible instead of drifting each time the page is opened. |
| **Population**             | Academies with `deleted_at IS NULL`, excluding the internal demo/e2e slugs `demo-showcase` and `e2e-live` (`excludeInternalAcademies()`). These are seeded fixtures, not customers.                                                                                                        |
| **Two different revenues** | **Mentoma revenue** = subscription invoices. **Academy GMV** = student payments. The platform takes **0% commission**, so GMV is never Mentoma income and the two are never added together.                                                                                                |
| **Timezone**               | All month boundaries are UTC.                                                                                                                                                                                                                                                              |

---

## 2. SaaS revenue

**Source: `AcademySubscriptionInvoice` where `status = 'PAID' AND amount > 0`.**

The `amount > 0` clause is what excludes trials: a free trial writes an invoice with `status: 'TRIAL'` and `amount: 0` (`common/services/free-trial.ts`). The filter is applied **in the query**, not after the fact, and there is a unit test asserting exactly that.

### Term length

Not stored anywhere. Derived as `round((ends_at − starts_at) / 30 days)`, floored at 1.

> We deliberately do **not** parse `months=N` out of the invoice `note` column, even though `academies.service.ts` does so elsewhere: `note` is free text and is only written on some code paths, so it silently under-reports.

### Recognised MRR

Each invoice contributes `amount / term_months` to **every month it covers**, from the month of `starts_at` to the month containing the last instant before `ends_at`. A quarterly invoice therefore appears as three equal months, not one spike.

Where an academy holds two overlapping invoices in one month (a mid-term plan change writes a separate prorated invoice) the contributions are **summed**.

| Metric   | Formula                                                                  |
| -------- | ------------------------------------------------------------------------ |
| **MRR**  | Sum of recognised MRR across academies in the latest month of the window |
| **ARR**  | `MRR × 12`                                                               |
| **ARPA** | `MRR ÷ paying academies`                                                 |

### The MRR bridge

Per month, comparing each academy against the previous month:

| Component   | Definition                                     |
| ----------- | ---------------------------------------------- |
| Starting    | Previous month's ending MRR                    |
| New         | Academies at 0 last month and > 0 this month   |
| Expansion   | Increase for an academy present in both months |
| Contraction | Decrease for an academy present in both months |
| Churned     | Academies > 0 last month and absent this month |
| Ending      | This month's total                             |

**Invariant, asserted in the test suite:** `starting + new + expansion − contraction − churned = ending`, for every month.

### Retention

Measured on the cohort of academies paying in the **first** month of the window, against what those same academies pay in the **last** month.

- **NRR** = `Σ last-month MRR of the cohort ÷ Σ first-month MRR` — can exceed 100%.
- **GRR** = `Σ min(last, first) ÷ Σ first` — expansion excluded, so it can never exceed 100%.
- **Logo retention** = share of the cohort still paying anything.
- **Monthly logo churn** = mean of `churned ÷ starting` across the months in the window.

Returns `null`, not `0`, when the opening cohort is empty. A null means "not measurable", and the UI shows `—`.

---

## 3. Customers

| Metric                                              | Source                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Plan, expiry, trial start                           | `AcademySubscription` — one row per academy                                                                  |
| Status (`ACTIVE`/`GRACE`/`FROZEN`/`PURGE_ELIGIBLE`) | **Computed**, never stored, by `resolveAcademyLifecycle()`. `INACTIVE` is reported when `expires_at` is null |
| Price paid, term, dates                             | The academy's most recent qualifying invoice                                                                 |
| Lifetime paid                                       | Sum of all qualifying invoices                                                                               |
| Trial conversion                                    | Academies whose `trial_started_at` falls in the window and that later hold a qualifying invoice              |
| Median days to convert                              | Trial start → first paid invoice, linear-interpolation median                                                |

### Time to value

Days from `Academy.created_at` to each milestone, reported as median and p75:

1. `first_course_created` — `MIN(Course.created_at)`
2. `first_enrollment` — `MIN(Enrollment.enrolled_at)` joined through `Course.academy_id`
3. `first_paid_invoice` — `MIN(starts_at)` of qualifying invoices

Academies that have not reached a milestone are excluded from that milestone's sample rather than counted as zero, so the median is not dragged down. `academies_measured` states the sample size for each.

---

## 4. Academy GMV (student-side money)

**Source: `Payment`, joined to the buyer through `Profile.academy_id`.**

`Payment` carries no `academy_id` of its own; the buyer's profile belongs to exactly one academy, which makes it the tenant key.

**Excluded:** any payment linked to an `AcademySubscriptionInvoice`. Those are academies paying _us_, and counting them as GMV would double-count our own revenue as customer volume.

| Metric                | Formula                                   |
| --------------------- | ----------------------------------------- |
| Paid volume / count   | `Payment.status = 'PAID'`                 |
| Checkout success rate | Paid ÷ all payment attempts in the window |
| Refund rate           | `Σ Payment.refund_amount ÷ paid volume`   |
| Open refund requests  | `RefundRequest.status = 'PENDING'`        |

Breakdowns by `status`, `provider` and `payment_method`.

---

## 5. People and activity

### Registrations

From `Profile` (`deleted_at IS NULL`), scoped to the academy population.

- **Total users** — distinct `user_id`, because one person can hold a profile in several academies.
- **Activation rate** — profiles with `login_count > 0` ÷ total profiles.
- **Active 7d / 30d** — from `Profile.last_login`.
- Monthly registrations and a breakdown by `Role.name`.

### Login activity — read this before quoting it

**Source: `LoginEvent`, a new append-only table.**

Before it existed, the only login data was `Profile.last_login` and `Profile.login_count` — mutable counters with **no history**, from which no time series, no DAU/WAU/MAU and no retention curve can be derived. The other candidate sources (`RefreshToken`, `TrafficLog`) are actively pruned by cleanup jobs.

One row is written per successful login, at the five points in `auth.service.ts` that already increment `login_count`. A **token refresh writes no row** — it renews a session, it is not a login — and there is a test asserting exactly that.

| Metric                          | Definition                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| DAU / WAU / MAU                 | Distinct `user_id` in the last 1 / 7 / 30 days                                            |
| Stickiness                      | DAU ÷ MAU                                                                                 |
| Logins per active user per week | Logins in 7 days ÷ WAU                                                                    |
| Login retention cohorts         | Cohort = month the profile was created; retained in month _N_ if any login occurred in it |

> ⚠️ **This series begins on the day the `LoginEvent` migration was applied.** Nothing before that date exists or can be reconstructed. `login_history_since` on the activity endpoint reports the true start, and it must be shown alongside any retention chart. Every other metric in this document is fully historical.

---

## 6. Catalog and the learning record

**Catalog** — from `Course` (`deleted_at IS NULL`), `Lesson`, `LiveSession`, `TutoringOffer`, `TutoringEngagement`:

- Courses by `course_type` (`OFFLINE` = recorded, `LIVE` = timetabled) and by `pricing_type`
- Published vs total
- Lessons by `lesson_type`
- Tutoring: offers by `TutoringOffer.kind` (`SOLO`/`GROUP`), engagements split on `group_key === 'SOLO'`

> `deleted_at IS NULL` is stated explicitly on every course query. Prisma's soft-delete extension does not reach `groupBy`, so leaving it implicit made the total and the per-type breakdown disagree — a real bug found and fixed during implementation.

**Learning record** — the switching cost, counted: quiz attempts, assignment submissions, graded submissions, discussion messages, live and tutoring attendance rows, certificates. Reported as totals plus monthly growth.

This is the moat metric. Its growth rate is the evidence that leaving gets more expensive over time.

---

## 7. Unit economics

| Metric                      | Formula                                       | Input                     |
| --------------------------- | --------------------------------------------- | ------------------------- |
| **CAC**                     | Marketing spend ÷ new paying academies        | `MarketingSpend` (manual) |
| **Gross margin**            | `(revenue − cost) ÷ revenue`                  | `PlatformFinancialRecord` |
| **CAC payback**             | `CAC ÷ (ARPA × gross margin)` months          | derived                   |
| **LTV**                     | `(ARPA × gross margin) ÷ monthly logo churn`  | derived                   |
| **LTV : CAC**               | `LTV ÷ CAC`                                   | derived                   |
| **Quick ratio**             | `(new + expansion) ÷ (contraction + churned)` | MRR bridge                |
| **MRR growth (annualised)** | `(ending ÷ starting)^(12 / months) − 1`       | MRR bridge                |
| **Rule of 40**              | `growth% + gross margin%`                     | derived                   |
| **Monthly burn**            | `(cost − revenue) ÷ months`                   | `PlatformFinancialRecord` |
| **Runway**                  | **Always null**                               | —                         |

### Declared caveats

The endpoint returns a `caveats` array naming every input it could not observe. Currently:

- `marketing_spend_not_entered` — CAC, payback and LTV:CAC are all null until spend is entered. **Marketing spend is an input, not a measurement**: the platform never sees ad spend, so a human types it in monthly, per channel.
- `no_platform_financial_records_for_period` — gross margin, Rule of 40 and burn need cost data in `PlatformFinancialRecord`.
- `runway_requires_cash_balance_not_stored_in_platform` — **cash on hand is not stored anywhere in the system**, so runway is structurally uncomputable here and is always returned as null rather than guessed.

---

## 8. Reconciliation — why the numbers can be trusted

A three-way tie-out, in the same shape as the existing `getIranSettlementReconciliation` so staff read one format:

**Leg 1 — Invoice → Payment.** Every non-`MANUAL` qualifying invoice should carry a `PAID` payment.

- `missing` — invoice with no paid payment. **Investigate.**
- `orphan` — a `PAID` payment whose `notes` begin `platform_` but which no invoice references. **Investigate.**
- `MANUAL` invoices are counted separately: staff settle them by hand, so they legitimately never touch a gateway.

**Leg 2 — Payment → Gateway.** Every linked payment should carry a `SUCCESS` `PaymentGatewayResponse`.

- `missing` — money recorded as received with no gateway confirmation. **Investigate.**

`balanced: true` means every leg ties out. **A non-zero delta is a defect in the money path, not a reporting artefact.** It is surfaced rather than hidden precisely because an investor will ask, and "we monitor it and here is today's number" is a far stronger answer than a clean-looking figure with no check behind it.

---

## 9. The snapshot ledger — why figures do not move

`MetricSnapshot` stores one immutable row per closed month, per scope (`PLATFORM`, or one per academy).

- Written by a cron on the 1st of each month, and on demand via `POST /platform-metrics/snapshot/tick`.
- **A closed month is written once and never updated.** Re-running the job skips months already present; a correction appends a new row and the old one remains.
- `source_hash` is a SHA-256 of the metric payload, so a hand-edited row is detectable.
- `eur_rate` is stored per row, so EUR figures are reproducible.
- The job emits `Metrics/SnapshotCompleted` on every run — **the absence of that event is how a missed run is detected.**

**Quote snapshot figures, not live ones.** A live recompute changes the moment a backdated invoice lands; "MRR as of 31 January" must return the same number in March as it did in February, and only the ledger guarantees that. The UI defaults to the snapshot source for this reason.

### Backfilled rows

On first run the ledger is backfilled from existing invoice history so the series is not empty. A backfilled row is reconstructed, not observed live, and is flagged by `backfilled: true` (`computed_at` more than a day after `period_end`). Backfilled _revenue_ is exact, because the invoices are historical. Backfilled _login activity_ is not available at all — see §5.

---

## 10. Export

- `GET /platform-metrics/export?section=…` — one section as CSV.
- `GET /platform-metrics/export/data-room` — **every** section in one file, CSV (sections separated by `## name` markers) or `?format=json`.

Numbers are written raw and unformatted so a spreadsheet can compute on them, and files carry a UTF-8 BOM so Excel renders Persian correctly.

---

## 11. What this cannot answer

Stated plainly, because an investor who finds an undisclosed gap discounts every other number, while one who sees you found it first does the opposite.

1. **Login retention has no history before the `LoginEvent` migration.** Lead with revenue, subscriptions, transactions, registrations and catalog — all fully historical — and label activity charts with `login_history_since`.
2. **CAC depends on hand-entered spend.** It is an input, not a measurement.
3. **Runway is uncomputable** without a cash balance the platform does not store.
4. **This is the instrument, not the traction.** Building it does not change what the numbers say — only whether they are believed.
5. **Two things a European raise needs that no dashboard provides** (see `mentoma-strategy-and-positioning.md` §5): a clean Western corporate structure — Delaware C-corp or EU entity, Stripe, GDPR — and enough elapsed time for a real retention number to exist.
