# Legal & Financial Documents (Iran v1) — version 3.0

Drafting templates for the **Islamic Republic of Iran** launch. **Not legal advice** — each must be
reviewed by a licensed Iranian attorney (وکیل دادگستری) and certified tax advisor (مشاور مالیاتی)
before use. Persian governs; English mirrors are for the phase-2 Western entity.

| Document | Purpose |
| --- | --- |
| [platform-academy-agreement.md](./platform-academy-agreement.md) | SaaS platform ⇄ academy contract (intermediary/agent model) |
| [terms-of-service.md](./terms-of-service.md) | Student / general-user terms |
| [privacy-policy.md](./privacy-policy.md) | Data handling (Iran now, GDPR-ready for phase 2) |
| [acceptable-use-policy.md](./acceptable-use-policy.md) | Prohibited content (ماده ۲۱), notice-and-takedown, indemnity, log retention |
| [PROMISE-AUDIT.md](./PROMISE-AUDIT.md) | **Every operative promise mapped to the code that backs it — update in the same commit as any legal edit** |
| [refund-policy.md](./refund-policy.md) | **No-refund** policy (Art. 38(a) immediate performance; 14-day trial); court-mandated refunds only |
| [staff-terms.md](./staff-terms.md) | Confidentiality & data-use undertaking for platform staff and academy managers/teachers |
| [en/](./en/) | English mirrors of the **Iran** documents (same regime, non-binding) |
| [phase2-eu/](./phase2-eu/) | Parked EU/Estonia drafts for phase 2 — **not seeded** |
| [iran-financial-legal-structure.md](./iran-financial-legal-structure.md) | Expert memo: aggregator tax risk, Moadian, VAT, eNamad, structure |

**Version 2.0 (2026-07):** the platform moved to **subscription-only** revenue — no commission on
enrollments, one free month per academy, per-plan storage quotas, and a read-only (never deleted)
state after expiry.

**Version 2.1 (2026-07):** the Platform may change subscription prices, plan features/quotas, or
introduce/discontinue plans **at any time and at its sole discretion, without prior notice** (the
previous 30-day-notice commitment is removed). An already-paid, confirmed billing period is never
repriced — a change only ever applies to the next renewal or a new purchase. Users/academies waive
claims arising from such changes, subject to the existing liability cap. Bumping `VERSION` in
`legal-documents.seed.ts` archives the prior version and requires every user to accept afresh.

**Version 2.3 (2026-08):** intermediary-liability shield. A new **acceptable-use-policy** carries the
ماده ۲۱ prohibited-content list, notice-and-takedown, uncapped academy indemnity, and the ماده ۲۳ log
retention duty (traffic data ≥6 months, identity ≥6 months after closure). It is **incorporated by
reference** into TERMS and ACADEMY_AGREEMENT — published and versioned as `ACCEPTABLE_USE`, but
deliberately **not** in `PLATFORM_REQUIRED_LEGAL_TYPES`, so it adds no extra consent step. The
agreement's §۸ now carries per-clause academy duties (identity, permit declaration, pre-publication
review, ownership warranty, judicial answerability, indemnity) and §۱۰.۶–۱۰.۸ the takedown and
retention rules.

**Version 2.4 (2026-08):** §7.1 of the acceptable-use policy rewritten to describe the retention that
is actually implemented (scope, exclusions, and the identity-after-closure rule) rather than a broader
promise. The version bump is deliberate: `LegalAcceptance` stores a content hash, so editing a
published version's body in place would leave past acceptances pointing at a hash that no longer
matches. Everyone re-accepts on next login.

**Version 3.0 (2026-09-12):** full legal revision against the code as it actually behaves and the
2026-09-07 no-refund decision. Highlights:

- **Facts re-aligned with code:** 14-day trial (`FREE_TRIAL_DAYS`, was "30 days"), quarterly 5% discount
  (`QUARTERLY_DISCOUNT_RATE`, was "no discount"), storage hard-block at 100% + one-shot packs (the ToS
  table still described per-GB overage), 20 GB trial traffic, tutoring-student seat, traffic never
  interrupts playback.
- **No refunds anywhere.** Student purchases start immediately at the student's request, so the 7-day
  withdrawal right of E-Commerce Act Art. 37 is excluded by Art. 38(a); academies buy for professional
  purposes (not consumers under Art. 2) and the 14-day trial is the evaluation window. Goodwill refunds
  are arranged by the academy **outside the platform**; the only platform-executed refund is one ordered
  by a court or bank, debited to the academy. One deliberate exception: agreement §10.2 — if the
  **platform** terminates without cause, the unused prepaid part is returned pro rata (keeping it would be
  unjust enrichment and a court would order it anyway).
- **New protections:** minors (guardian consent; academy obligation), technical hosting/transcoding
  licence, SMS consent, live-class recording consent, wallet hold + set-off + AML, negative-balance
  duty, KYC before settlement, duty to defend, assignment to a successor entity, notices deemed served on
  dispatch, severability/survival, intentional-fault carve-out (which is what makes the liability cap
  enforceable under Iranian law), 30-day negotiation step before court.
- **Platform identity:** `{{NATIONAL_ID}}`/`{{ECONOMIC_CODE}}` were never substituted and rendered raw;
  the documents now reference the footer/eNamad registration instead. Courts: "the platform's registered
  seat as stated in the footer" replaces the `[محل ثبت سکو]` placeholder.
- **staff-terms.md** was a placeholder shown as a binding document to every manager/teacher; it is now a
  real confidentiality undertaking (least privilege, no external copies/AI tools, logging, indefinite
  duration, Arts. 58/59/71/72 E-Commerce Act, Art. 648 Penal Code).
- **`en/` was a different legal regime.** The English ToS/privacy/refund/agreement were Estonian-law
  drafts with an EU 14-day cooling-off right and an unnamed OÜ entity, published under the `en` locale
  (reachable via `Accept-Language`). They are parked in `phase2-eu/` and `en/` now mirrors the Iran text.

**Abuse intake (AUP §5.5) — implemented.** `AbuseReport` accepts anonymous reports (visitors and
students spot most violations; requiring an account would filter out exactly those), rate-limited per
IP. Every report stamps a `due_at` computed by `business-hours.ts`, which skips Thursday/Friday — so
"were we inside the 72 business hours" is answerable from data instead of asserted. Staff triage via
`GET/PATCH /compliance/abuse-reports`; `countOverdue()` is the number that says the promise is being
missed.

**Retention (Article 23) — implemented.** `TrafficLog` (added 2026-08-21) durably records the
identifying half of every state-changing request: actor, timestamp, IP, academy, method, path and
status. It holds **no foreign key** and `User` is soft-deleted, so records stay attributable after an
account closes. `TrafficLogRetentionService` prunes nightly and **clamps the configured window to a
180-day floor**, so a bad `TRAFFIC_LOG_RETENTION_DAYS` cannot prune below the legal minimum. Request
bodies and query strings are deliberately never stored — retaining passwords and OTPs for six months
would create a bigger problem than it solves. `SitePublishAudit` separately records who made each
academy site public. Note the deliberate scope limit, which §7.1 now states plainly: GETs are not
recorded, because a row per read identifies nobody new and multiplies write volume.

**Why not eNamad per academy:** eNamad is issued per **domain** to the **payment-gateway holder**, and
academies run on our subdomains under one platform gateway — so they cannot obtain one, and it is a
payment-trust seal, not a content licence. The platform holds one seal; each academy instead supplies a
verified publisher identity, enforced in code by
`Backend/src/common/services/seller-identity.service.ts`. Its `assertPublishable` gates
`UITemplateService.publishSite` — legal name, national/company ID (check-digit verified), address, and
the permit declaration are required before an academy's site can go public. Signup is untouched.

**How these connect to code:** `Backend/prisma/legal-documents.seed.ts` (via `node dist/prisma/seed.js`
on every API pod start, or `npm run migrate:deploy` / `npm run seed:legal`) publishes the first four
as versioned `LegalDocument` rows; acceptance is recorded in `LegalAcceptance` (version + timestamp +
IP + content hash). Placeholders like `{{LEGAL_ENTITY_NAME}}` come from `PlatformSetting`.

**Production gotcha:** if `GET /v1/legal/documents` returns `[]`, registration will fail with
`No current TERMS document for locale fa`. Run `node dist/prisma/seed.js` in the API pod (or redeploy
so the entrypoint seeds automatically).
