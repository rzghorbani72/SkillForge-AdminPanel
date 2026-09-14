# Business & Product Strategy Analysis

White-label EdTech LMS for teachers & academy managers. Primary market: MENA / Europe.
Positioning: premium, trustworthy, **not a marketplace** (commission only on the bootstrap Starter tier).

---

## 1. Business Model Validation

### Commission-on-Starter
Validated pattern (Teachable free = 10% + $1/txn, Podia old = 8%, Gumroad = commission-only).
Works because it aligns your revenue with the teacher's before they trust you with a flat fee.

> **The starter tier must be a slope, not a floor.** Price it so any teacher making real money loses money by staying on it.

Example: Starter teacher does $2,000/mo, 8% = $160/mo. Growth is a $39 flat fee → upgrade math sells itself past ~$500/mo. That crossover is the trigger you *want*.

Risk = adverse selection (low-volume hobbyists with flat support cost). Mitigate by making the upgrade obviously cheaper at real volume.

- **Commission %: 8%** (between Teachable's 10% and Podia's 8% — feels fair).
- Frame the flat tier as the *escape hatch from commission* ("switch to flat anytime, pay 0%").

### Gating subscriptions / bundles
- **Single course** → all tiers (table stakes).
- **Subscription (recurring)** → gate to **Growth+** (recurring-income teachers can afford flat fee; clean upgrade trigger).
- **Bundles** → Growth+ (or 1 bundle on Starter, unlimited above).

Rationale: gate monetization *mechanics*, not student counts — less resented, pushes the right users up.

### Payouts — biggest hidden landmine
Stripe Connect Express is the default everywhere **except MENA** (Stripe coverage thin, UAE only).

**Abstract the payout provider behind one internal `PaymentProvider` interface:**
- **Europe / global:** Stripe Connect Express (KYC, payout, tax forms — don't rebuild).
- **MENA:** Paymob (Egypt/Gulf), Tap Payments (Gulf), PayTabs / Checkout.com (broad MENA).

This is the one architectural piece **NOT to defer** — retrofitting multi-PSP split payouts is brutal.

Academy model: money → academy manager's connected account; manager handles teacher splits. **Start with manager-level payout + internal teacher accounting.** Automated multi-destination split payouts = v2.

---

## 2. Pricing Strategy

| Tier | Monthly | Annual (save 20%) | Commission | Teachers | Key gates |
|---|---|---|---|---|---|
| **Starter** | €0 / low | €0 | **8%/enrollment** | 1 | Single course only, 1 published course, basic live class (1 slot), academy branding |
| **Growth** | **€39/mo** | €31/mo (€372/yr) | **0%** | 1 | Unlimited courses, subscriptions + bundles, full live class, lesson access control, custom domain |
| **Pro / Academy** | **€99/mo** | €79/mo (€948/yr) | **0%** | up to 10 | + multi-teacher, academy feature toggles, unified revenue/student reporting, role management |
| **Enterprise** | Custom | Custom | 0% | Unlimited | White-label, SSO, SLA, dedicated support, per-teacher domains |

- €39 / €99 mirror Teachable Basic ($39) / Thinkific Start ($99) — priced *at market*. **Never be the cheap option; be the *fairer* one (0% vs commission).**
- **20% annual discount** (2.4 months free) is the standard sweet spot. Don't go higher.

### Upgrade triggers (build into the product)
- **Starter → Growth:** revenue past ~€500/mo, wanting subscriptions/bundles, custom domain, hitting 1-course cap.
- **Growth → Pro:** inviting a **second teacher**. THE clean trigger — show the "invite teacher" button in Growth, gate the action with "Upgrade to Academy."

### Trial vs freemium — do both
- **Starter commission tier = freemium** (free to start, you earn when they earn; removes activation barrier — key for MENA card friction).
- **14-day free trial of Growth/Pro**, **no credit card to start**, ask for payment at conversion.

---

## 3. Positioning & Differentiation

| Competitor | Strength | Weakness you exploit |
|---|---|---|
| **Teachable** | Brand, simplicity | Weak live/cohort, US-centric payments, no multi-teacher academy |
| **Kajabi** | All-in-one marketing | Expensive ($149+), overkill, no real academy model |
| **Thinkific** | Course-building depth | Live classes an afterthought, no granular access control |
| **Podia** | Cheap, simple | Thin features, not premium, no academy layer |

**None are built around multi-teacher academy + live class + granular access. That's the wedge.**

### Sharpest differentiator
**"Run a real academy, not just a course store."**
1. Academy / multi-teacher hierarchy with per-academy feature governance + unified reporting.
2. Granular, scheduled lesson access control (group → individual → drip) = teaching infrastructure.
3. Native live-class slot booking + per-slot meeting links.

> Positioning line: *"The platform for academies that teach live, not just sell videos."*

### ICP — pick ONE first
**Small-to-mid tutoring / language / exam-prep academy (3–15 teachers) in MENA.** They have the multi-teacher pain, run live classes, have budget + a clear decision-maker (the manager). **Land the manager → teachers come bundled (one sale = 10 seats).**

---

## 4. Go-To-Market

### Channels
1. Founder-led direct sales (first ~50 customers — academies are high-touch).
2. Niche communities (language-teacher FB groups, coding-bootcamp networks, MENA Telegram/WhatsApp).
3. Migration offers ("Switch from spreadsheets/Teachable — free import").
4. Referral loop (teachers leaving an academy → direct Growth customers).

### Niche-first? Yes.
Launch into **language/exam-prep tutoring centers in MENA**, dominate, get lookalike logos, then expand to coding bootcamps, then fitness/skills. Narrow ICP = sharp message = faster word-of-mouth.

### 6-month plan
- **M1–2:** MVP hardening + payments/payout for ONE region (UAE or Egypt). Recruit 5 design-partner academies.
- **M3:** White-glove onboarding + migration. Instrument. Fix top 5 frictions.
- **M4:** Public launch to the niche. Marketing site + 1–2 case studies.
- **M5:** Open self-serve Starter (commission) as top-of-funnel + referral. Add 2nd payment region.
- **M6:** First paid acquisition tests, referral program, double down on the winning channel.

**North-star:** academies with ≥1 paying student transacting weekly (activation > vanity signups).

---

## 5. Website Strategy

### Pages
Home · For Teachers · For Academies · Features (Live Classes / Access Control / Academy Mgmt) · Pricing · Use cases/Niches · Customer stories · About/Trust · Docs/Help · Blog · Contact/Book a demo.

### Homepage flow
1. Hero: *"Run your entire academy in one place."* Dual CTA: **[Book a demo]** + **[Start free]**.
2. Social proof bar (logos / "trusted by N academies").
3. The problem (spreadsheets + Zoom + payment chaos).
4. 3 differentiator blocks (live booking · access control · academy mgmt) — show, don't tell.
5. Outcome/quote from a real academy.
6. Pricing preview — **"Keep 100% of what you earn."**
7. Objection handling (regional payments, migration, security).
8. Final CTA.

### Messaging
- Lead with **money kept + time saved**: *"0% commission. Your students, your revenue, your brand."*
- Trust signals matter disproportionately (local payment logos, security, real faces, response-time promise).
- Primary CTA = **Book a demo** (academies); secondary = **Start free** (commission tier).
- Target **both** but **academy-led** — two distinct landing pages, one nav.

---

## 6. MVP Feature Prioritization

### Must-have (launch)
- Auth + 4 roles (student, teacher, manager, admin)
- Course/lesson builder (video + content)
- Single-course one-time enrollment + checkout (one region)
- **Live class slots + per-slot meeting link + booking** ← differentiator
- **Lesson access control: group → individual → scheduled drip** ← differentiator
- **Academy: manager invites teachers, unified student/revenue view** ← differentiator
- Per-academy feature toggles (one-time / subscription / live class)
- Student-facing storefront per academy
- Basic manager-level payout (Stripe Connect or one MENA PSP)

### Defer (v2/v3)
Subscriptions + bundles · automated multi-teacher split payouts · per-teacher white-label/domains · advanced analytics · affiliate system · mobile apps · extra regions · SSO.

> **Ship your differentiators in MVP, defer table-stakes monetization mechanics.** Most founders do the opposite.

### Gaps users will expect
Transactional email + **class reminders** · coupons/discount codes · certificates · lightweight quizzes/assignments · student progress tracking · mobile-responsive student UX (non-negotiable in MENA).

---

## 7. Academy Configuration & Permission Model

- **Per-academy feature toggling = selling point** if framed as *governance, not configuration*. Opinionated defaults (one-time ON, live class ON, subscription OFF) + progressive disclosure. Don't make it a setup wall.
- **Toggles silently enforced** — disabled features simply don't appear in the teacher's UI (no greyed-out politics).
- **Manager-as-teacher = one unified app with a role switcher** ("Managing [Academy]" ↔ "Teaching as [Me]"). Teaching view = the exact same component tree as a regular teacher — **don't build it twice.**
- **Teacher independent presence: locked-in by default** (protects the paying manager) **+ a separate paid Growth account** they can run in parallel (referral/expansion engine, not churn to Teachable).
- A course/student belongs to **either** an academy scope **or** a teacher's independent scope — never ambiguously both. Model separate ownership scopes from day one.

---

## Three decisions to lock before more code
1. **Payout / multi-region PSP abstraction** — expensive to retrofit.
2. **Ownership-scope model** (academy-owned vs teacher-owned courses/students) — deep Prisma schema impact.
3. **Unified app with manager/teacher role switch** — affects AdminPanel routing/layout.

Everything else (subscriptions, bundles, extra regions, white-label) is safely deferrable.
