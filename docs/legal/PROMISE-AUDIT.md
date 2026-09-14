# Legal promise → code audit

Every operative commitment in the published legal documents, and the code that backs it.

**Why this file exists:** a legal document is a list of promises. An unbacked promise is worse
than no promise — it is a written admission of a duty with no evidence it was met. When you edit
a legal document, add or update the row here in the same commit; when you change code that backs
a row, check the wording still matches.

**Rule:** a row is either `code` (enforced automatically), `manual` (a human applies it, which is
legitimate but must be a real workflow), or `gap` (nothing backs it — fix the code or the wording).

Last verified: **2026-09-12**, legal version **3.0**.

---

## Acceptable Use Policy

| § | Promise | Backed by | Type |
| --- | --- | --- | --- |
| 1.2 | Platform does not pre-screen content | No pre-publication gate exists; review is after the fact | `code` |
| 2.3 | Academy declares it holds required teaching permits | `Academy.permit_declared_at`, required by `SellerIdentityService.assertPublishable` | `code` |
| 2.4 | Going public conditioned on complete identity | `assertPublishable` gates `UITemplateService.publishSite` | `code` |
| 3 | Prohibited-content list | `REVIEW_KEYWORDS` flags a subset for review; the list itself is a notice, not an automated filter | `manual` |
| 5.1 | Remove content / suspend at any time | `ContentReviewService.review` → `AcademySiteStatusService.disable` | `code` |
| 5.2 | Immediate action on judicial order | Same suspend path, invoked by staff without waiting for the SLA | `manual` |
| 5.3 | No refund for a breach suspension | Refunds are always human-approved (`resolveRefundRequest`); staff apply the policy | `manual` |
| 5.5 | Anonymous reporting + 72 business-hour review | `AbuseReportService` + `business-hours.ts` (`due_at`, `countOverdue`); form in edusphere footer; queue in AdminPanel | `code` |
| 7.1 | Traffic data retained ≥6 months | `TrafficLog` + `TrafficLogRetentionService` (180-day clamped floor) | `code` |
| 7.1.1 | Identity retained ≥6 months after closure | `TrafficLog` has no FK; `User` is soft-deleted so records stay attributable | `code` |
| 7.2 | Publisher recorded on every site publish | `SitePublishAudit` (actor, time, IP, identity snapshot, no FK) | `code` |
| 7.3 | Retention survives an erasure request | Retention is a legal-basis carve-out; no deletion path touches `TrafficLog` | `code` |

## Platform ⇄ Academy Agreement

| § | Promise | Backed by | Type |
| --- | --- | --- | --- |
| 3.2 | 14-day trial, once per person | `FREE_TRIAL_DAYS`, `trial-transfer.service.ts` (credit is per creator manager) | `code` |
| 3.2.1 | Trial: subdomain only, 1 GB storage | `DomainService` trial check, `TRIAL_STORAGE_GB` | `code` |
| 3.3 | Storage hard-blocks at 100%, packs available | `PlanLimitsService` storage assert; `storage_addon_*` settings | `code` |
| 3.6 | A paid period is never repriced | Plan changes apply at renewal only; paid period reads its own stored terms | `code` |
| 3.8 | Subscription/packs non-refundable | Refund engine has no subscription path; `refunds_enabled` kill-switch still to ship | `manual` |
| 4.3 | KYC before first settlement | `Academy.kyc_*` + verification wizard; payout gate must check `kyc_status` | `manual` |
| 4.4 | Settlement hold + wallet set-off | Owner suspend/hold actions exist; set-off is a contractual right, applied by finance staff | `manual` |
| 6.2 | Goodwill refunds happen outside the platform | Pending: `refunds_enabled=false` kill-switch (403 on `/refunds`, hide UI) — until then staff must not approve requests | `gap` |
| 10.2 | Pro-rata return when the platform terminates without cause | Finance staff action, no code path | `manual` |
| 7.2 | Export available at any time, including while locked | `GET /academies/current/export` — deliberately a GET so it survives freeze | `code` |
| 8.1 | Identity required before public site | `assertPublishable` | `code` |
| 8.9 | Uncapped academy indemnity | Contractual only — nothing to enforce in code | `manual` |
| 10.3 | 5-day read-only payment window | `AcademyLifecycleService` | `code` |
| 10.4 | Day 30 media deleted, day 90 full deletion | `AcademyLifecycleService` wind-down | `code` |
| 10.6 | Notice and takedown | `ContentReviewService` + suspend path | `code` |
| 10.8 | Article 23 retention | `TrafficLog` + retention job | `code` |

## Staff Terms

| § | Promise | Backed by | Type |
| --- | --- | --- | --- |
| 1 | Required for every MANAGER/TEACHER and platform staff | `STAFF_REQUIRED_LEGAL_TYPES` + `LegalConsentGuard` | `code` |
| 4 | Every access to others' data is logged | `SupportAccessLog` (platform staff); academy roles via `TrafficLog` | `code` |

## Terms of Service

| § | Promise | Backed by | Type |
| --- | --- | --- | --- |
| 2 | No account sharing/transfer | Stated duty; not technically prevented | `manual` |
| 3 | Under-18 users need guardian consent | Stated duty on the academy; no age field or gate in code | `manual` |
| 7.2 | Access starts immediately at the student's request (Art. 38(a)) | Enrollment activates on payment verify; checkout page should state it in one line | `gap` |
| 7.6 | Locked days are added to student access on reactivation | `extendFrozenTerms` (reactivation service) | `code` |
| 9 | No student refund / no refund request in the platform | `POST /refunds/request` still live until the kill-switch ships | `gap` |
| 10.2 | Live attendance auto-recorded | `LiveSessionAttendance` | `code` |
| 13.1 | Service SMS consent | OTP/reminder SMS via `SmsService`; consent recorded through ToS acceptance | `code` |
| 7.6 | Access term defaults to 365 days, capped by academy coverage | `access-term.ts` (`MIN_SELLABLE_ACCESS_DAYS`) | `code` |
| 12.1 | Platform is host, not publisher | No pre-screening exists | `code` |
| 12.4 | Removal/suspension at any time | Suspend path | `code` |
| 12.5 | Abuse reporting | `AbuseReportService` | `code` |

## Privacy Policy

| § | Promise | Backed by | Type |
| --- | --- | --- | --- |
| 5 | Learning record kept 90 days after closure, then deleted | `AcademyLifecycleService` | `code` |
| 2 | KYC data (national ID image, birth date, IBAN) collected | `Academy.kyc_*`, `SellerIdentityService` | `code` |
| 7 | Support-staff data access is logged | `SupportAccessLog` | `code` |
| 7 | Breach notification "as soon as reasonably possible" | Manual incident workflow | `manual` |
| 5 | Traffic/publisher logs, 6-month legal basis | `TrafficLog`, `SitePublishAudit` | `code` |

---

## Known limits (stated, not hidden)

- **GETs are not recorded.** §7.1 says so explicitly. A row per read identifies nobody new and
  multiplies write volume; recording state-changing requests is the defensible reading of
  Article 23.
- **Request bodies and query strings are never stored.** Retaining passwords and OTPs for six
  months would create a larger problem than it solves. §7.1 states this.
- **Keyword scanning flags, never blocks.** A false positive against a legitimate academy costs
  more trust than a slow review costs risk.
- **Traffic is deliberately absent from the legal text.** The code still meters and caps `monthly_traffic_gb`
  (panel warning, packs), but HLS lesson playback is unmetered, so no promise or limit is made to the
  academy about bandwidth. Re-add a clause only once the meter covers the HLS path.
- **Public marketing copy is not covered by this audit.** `edusphere` `platform-terms-page.tsx` and the
  checkout `securePaymentNote` ("۷ روز ضمانت بازگشت وجه") still promise a refund window — a public
  promise beats the binding text in a consumer dispute. Fix them together with the refund kill-switch.
- **`manual` rows depend on a human actually doing the thing.** They are not defects, but they
  are only as true as the workflow behind them.
