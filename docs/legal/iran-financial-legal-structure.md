# Iran Financial & Legal Structure — ساختار مالی و حقوقی (ایران)

> **Version:** 1.0 · **Jurisdiction:** Islamic Republic of Iran (v1 launch)
>
> ⚠️ **Disclaimer:** This memo is a **founder-level expert briefing**, not legal or tax advice. The items below
> carry real regulatory consequences in Iran. Before acting, confirm each with a **licensed Iranian attorney
> (وکیل دادگستری)** and a **certified tax advisor / مشاور مالیاتی**. Numbers (VAT %, thresholds) change yearly —
> verify the current rate with سازمان امور مالیاتی.

این سند خطرها و راه‌حل‌های مالی-حقوقیِ راه‌اندازی نسخهٔ ۱ در **ایران** را جمع‌بندی می‌کند.

---

## 0. Model change (2026) — تغییر مدل درآمدی

> **The platform no longer takes any commission on enrollments.** Revenue is a fixed SaaS subscription
> (Starter / Growth / Business) plus storage overage; student money is remitted to the academy **in full**.
>
> **Effect on this memo:** the aggregator exposure below is **reduced but not eliminated** — GMV still
> passes through the platform's PayPing account, so the "money in your account looks like your revenue"
> risk in §1 stands. What changes is the defence: the platform's declared income is now a clean, easily
> evidenced subscription line with **no percentage tie to GMV**, which makes the agent/collection
> position far easier to argue.
>
> **Sections below that reason about the 8% commission are historical.** They must be re-read by the
> attorney and tax advisor against the subscription-only model before being relied on.
>
> **این سند بر پایهٔ مدل کارمزدی نوشته شده است.** از ۲۰۲۶ درآمد سکو فقط «حق اشتراک» است و هیچ درصدی از
> فروش دوره‌ها برداشته نمی‌شود؛ بندهای مربوط به کارمزد باید توسط وکیل و مشاور مالیاتی بازبینی شوند.

---

## 1. The core risk: the aggregator tax trap — تلهٔ مالیاتی مدل تجمیعی

**Decision in code:** the platform collects all student money through **one platform PayPing account**
(see memory `payment-aggregator-model-decision`). This enables the commission cut — but creates the
single biggest financial risk:

> **From the tax authority's view, money landing in your account looks like _your_ revenue.** If 100%
> of GMV (e.g. 10 billion Toman of course sales) flows through your account, you can be assessed VAT and
> income tax on the **entire GMV**, not just your **8% commission** — a catastrophic, business-ending
> misclassification.

### The solution we implemented: agent / pass-through framing
- The **Academy is the seller of record**; the platform is a **واسطه/کارگزار وصول** (collection agent).
- The **platform↔academy contract** ([platform-academy-agreement.md](./platform-academy-agreement.md))
  states this explicitly (clause 2).
- **Invoices** identify the Academy as seller and the platform as collecting agent — see §4 and the
  `getReceipt()` endpoint (`Backend/src/payments`).
- The **ledger already separates** `PLATFORM_FEE` from `ACADEMY_PAYOUT` (`payment-providers/ledger`),
  which is exactly the documentary evidence needed to prove only the fee is your revenue.

**Action:** keep an auditable trail showing each settlement to academies is a **pass-through payout**,
not a platform expense. Your taxable base = commission + plan fees only.

---

## 2. Mandatory e-invoicing — سامانه مودیان و پایانه‌های فروشگاهی

Iran's **سامانه مودیان** (Taxpayers System, Law of 1398) requires registered businesses to issue
**electronic invoices (صورتحساب الکترونیکی)** with seller/buyer tax IDs and a standard format.

- **Now (v1):** the `getReceipt()` output already carries the legally required fields — seller
  (academy), collecting agent (platform), VAT line, sequential invoice number.
- **Phase 2:** live submission to the Moadian API (معافیت/مهلت‌ها را با مشاور مالیاتی بررسی کنید). Treated
  as out-of-scope for code now, but the **data shape is ready**.

**Action:** register in کارپوشهٔ مودیان, obtain the شناسهٔ یکتای حافظهٔ مالیاتی, and plan the API
integration for phase 2.

---

## 3. VAT — مالیات بر ارزش افزوده
- Configured as `PlatformSetting.vat_rate` (default 0.09). **Verify the current statutory rate yearly.**
- VAT is computed after discount and snapshotted into `Payment.notes`; the refund engine reverses it
  proportionally.
- **Educational services may have VAT exemptions** under Iranian law — confirm with your advisor whether
  course sales by academies qualify, and whether your **commission/SaaS fee** is itself VAT-able
  (software services generally are).

**Action:** decide (with advisor) the correct VAT treatment for (a) academy course sales and (b) your
commission, and set `vat_rate` / exemption flags accordingly.

---

## 4. Invoice identity fields — هویت صورتحساب
The receipt must show:
- **Seller = Academy:** `Academy.legal_entity_name`, `national_id` (شناسه/کد ملی), `economic_code`,
  `vat_registration_no` (new fields added to the `Academy` model).
- **Collecting agent = Platform:** `PlatformSetting.legal_entity_name`, `vat_registration_no`,
  `economic_code` (already present).
- Amount, discount, VAT line, sequential invoice number, date.

**Action:** populate these identity fields during academy onboarding (KYC) so receipts are complete.

---

## 5. ماده ۱۶۹ — quarterly transaction reporting
Article 169 of the Direct Taxes Act requires periodic reporting of transactions (صورت معاملات فصلی).
As an intermediary holding others' funds, keep clean, exportable per-academy settlement reports —
the existing `GET /financial/academies/settlement-table` and CSV export cover this.

**Action:** confirm with advisor whether the platform files فصلی for its commission, and whether
academies file for their sales.

---

## 6. eNamad & gateway compliance — نماد اعتماد الکترونیکی و شاپرک
- To legally collect online payments in Iran you typically need **نماد اعتماد الکترونیکی (eNamad)** and a
  PSP/درگاه contract (PayPing/Zarinpal/Saman → Shaparak/شبکهٔ بانکی).
- The aggregator model (collecting on behalf of many academies through one PSP account) must be
  **disclosed to and permitted by your PSP** — some PSPs restrict third-party fund collection.

**Action:** verify your PSP's terms allow marketplace/aggregator collection; obtain eNamad for the
platform domain.

---

## 7. KYC / AML on payouts — احراز هویت و مبارزه با پول‌شویی
- Settlement only to a **Sheba account in the academy's registered name** (contract clause 4.3; enforced
  by `AcademyBankAccount` verification).
- Keep identity + bank records for audit.

**Action:** make bank-account name-match verification a hard gate before any withdrawal is approved.

---

## 8. Record retention & dispute defense — نگهداری سوابق
- **Acceptance proof:** the new `LegalAcceptance` table stores version + timestamp + IP + content hash
  for every accepted document — your primary defense in any dispute (Article 12, E-Commerce Act).
- **Financial records:** keep for the statutory period (commonly ~10 years for tax) before deletion.

---

## 9. Recommended corporate structure — ساختار شرکتی پیشنهادی
Per the strategy doc, run a **two-entity model**:
- **Iran entity (beachhead + build base):** holds the local PSP contract, eNamad, and Iranian tax
  registration; operates v1.
- **Clean Western entity (phase 2):** US Delaware C-corp or EU company for the Western raise — Stripe,
  EUR/USD, GDPR. Keep IP assignable to this entity from day one (private repos, clear ownership).

**Action:** keep code, brand, and IP cleanly assignable so the Western entity can hold them later
without an Iran-entanglement problem in due diligence.

---

## 10. Prioritized action checklist
1. **[Legal]** Have an Iranian attorney review all five `docs/legal/*` documents.
2. **[Tax]** Confirm the agent/pass-through VAT and income-tax treatment with a مشاور مالیاتی; set
   `vat_rate` and exemption handling accordingly.
3. **[Compliance]** Confirm your PSP permits aggregator collection; obtain eNamad.
4. **[Onboarding]** Collect academy tax-identity fields (KYC) and verify Sheba name-match.
5. **[Records]** Ship the `LegalAcceptance` audit + `getReceipt()` (this implementation).
6. **[Phase 2]** Plan Moadian API integration and the Western entity for the EUR/Stripe/GDPR rail.
