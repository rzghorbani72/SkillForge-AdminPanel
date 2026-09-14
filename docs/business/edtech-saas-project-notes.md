# EdTech SaaS Platform — Project Notes & Strategy

_Saved from planning session — Claude.ai_

---

## 1. Product Overview

A white-label LMS SaaS platform targeting teachers and academy managers. Similar to Teachable but with key differentiators around live classes, granular lesson access control, and a multi-teacher academy management layer.

### Target Audience

- Individual teachers who want to sell courses and manage students
- Academy managers who oversee multiple teachers, manage student rosters, and want unified reporting

---

## 2. Core Enrollment & Access Models

| Model         | Description                                              |
| ------------- | -------------------------------------------------------- |
| Single course | One-time enrollment, student pays once                   |
| Subscription  | Recurring plan unlocks all "subscription-tagged" courses |
| Bundle        | One-time purchase of a curated package of courses        |

---

## 3. Live Class System

- Teachers set multiple class time slots per course
- Students buy/reserve a specific slot
- Teacher assigns a meeting link (Zoom, Google Meet, etc.) per slot
- Students see the link at the right time (not before)

---

## 4. Lesson Access Control (Key Differentiator)

Three modes with a clear priority hierarchy:

1. **Group access** — teacher assigns lesson access to a group of students
2. **Individual access** — per-student override
3. **Scheduled drip** — lesson unlocks at a specific time (aligned with class schedule)

**Priority rule:** Group rule → Individual override → Scheduled unlock

---

## 5. Platform Roles & Hierarchy

| Role            | Description                                            |
| --------------- | ------------------------------------------------------ |
| Student         | Enrolls, accesses courses and live classes             |
| Teacher         | Builds courses, manages own students, sets class times |
| Academy Manager | Is ALSO a teacher themselves (dual role)               |
| Platform Admin  | Us — controls global tier permissions                  |

### Academy Manager capabilities:

- Add/invite other teachers to their academy
- Enable or disable specific features per their academy:
  - One-time enrollment (on/off)
  - Subscription access (on/off)
  - Live class system (on/off)
- See unified student + revenue data across all teachers
- Control which features their teachers can use

### Key behaviors:

- A manager running a small solo academy = acts as teacher + manager simultaneously
- A manager running a large academy = delegates teaching, focuses on oversight
- Feature toggles are set at the academy level — teachers cannot override
- A teacher inside an academy operates within the feature set their manager enabled

---

## 6. Monetization Model

- We sell the platform to teachers/academies (B2B SaaS)
- **Zero commission** on all packages EXCEPT the cheapest Starter tier
- Starter tier: commission per student enrollment (bootstrap model)
- Larger packages: flat monthly/annual fee, zero commission

### Proposed Tiers (Rough)

| Tier          | Model                     | Notes                            |
| ------------- | ------------------------- | -------------------------------- |
| Starter       | Commission per enrollment | Small businesses, cheapest entry |
| Growth        | Flat fee, zero commission | Individual teacher               |
| Pro / Academy | Flat fee, zero commission | Multi-teacher, academy features  |
| Enterprise    | Custom pricing            | White-label, fully custom        |

---

## 7. Competitor Analysis

**No exact match exists in the market.** The specific combination of manager-who-is-also-a-teacher + feature toggles per academy + live class booking + per-lesson per-student access control does not exist as a single product.

### Feature Comparison

| Feature                                | Teachable | Kajabi | LearnWorlds    | Teachfloor | This Platform |
| -------------------------------------- | --------- | ------ | -------------- | ---------- | ------------- |
| Manager = also teacher                 | ✗         | ✗      | ✗              | ✗          | ✓             |
| Manager adds teachers                  | partial   | ✗      | ✓ (admin only) | ✓          | ✓             |
| Per-academy feature toggles            | ✗         | ✗      | ✗              | ✗          | ✓             |
| Live class slot booking                | ✗         | ✗      | ✗              | ✗          | ✓             |
| Per-lesson per-student access          | ✗         | ✗      | ✗              | ✗          | ✓             |
| Group → individual → schedule priority | ✗         | ✗      | ✗              | ✗          | ✓             |

### Key Competitors Summary

- **Teachable & Kajabi** — solo creator focused, no multi-teacher academy structure
- **LearnWorlds** — closest in roles/permissions, but admin ≠ teacher, no feature toggles
- **Teachfloor** — cohort-focused, no live class booking or per-lesson access control
- **EzyCourse** — most feature-rich all-in-one but still single-creator model

### Market Position

The platform fills a gap between solo-creator platforms (Teachable, Kajabi) and full enterprise LMS systems (Docebo, TalentLMS). The sweet spot — small-to-medium academies with real teachers, real students, and real operational complexity — is genuinely underserved.

---

## 8. Open Questions to Resolve

### Access & Architecture

- Is "subscription tag" set per-course by the teacher or per-platform-plan?
- Is a live class booking separate from course enrollment, or does booking grant full course access?
- Lesson drip rule: unlocks after class happens (teacher-triggered), fixed date, or N days from enrollment?

### Billing

- Commission on Starter: per unique student, or per enrollment event?
- Teacher payout model: Stripe Connect, manual, or split?

### Permissions

- Does the academy manager see ALL student data across all teachers, or only their academy's students? (GDPR relevant)
- Can a teacher exist both independently AND under an academy simultaneously?
- Should feature toggles be visible to teachers, or silently enforced?
- Separate dashboards for manager vs teacher view, or unified with role switching?

---

## 9. Features Worth Adding (Not Yet Scoped)

- Completion certificates
- Student messaging / class announcements
- Waitlist for full live class slots
- Enrollment expiry (e.g. "access for 12 months")

---

## 10. Opus Analysis Prompt

Use this prompt with Claude Opus for deep business model and strategy analysis:

```
You are a senior product strategist and SaaS business consultant with deep expertise
in EdTech platforms, marketplace monetization, and B2B SaaS go-to-market strategy.

I am building an EdTech SaaS platform — a white-label LMS similar to Teachable but
targeted at teachers and academy managers. Here is the full product scope:

---

## PRODUCT OVERVIEW

**Target audience:**
- Individual teachers who want to sell courses and manage students
- Academy managers who oversee multiple teachers, manage student rosters, and
  want unified reporting

**Core access/enrollment models:**
1. Single course — one-time enrollment, student pays once and gets access
2. Subscription — student buys a recurring subscription that unlocks all courses
   tagged as "subscription-included" by the teacher
3. Bundle — one-time purchase of a curated package of courses

**Live class system:**
- Teachers set multiple class time slots per course
- Students buy/reserve a specific slot
- Teacher assigns a meeting link (Zoom, Google Meet, etc.) per slot
- Students see the link at the right time

**Lesson access control (key differentiator):**
- Teacher can grant lesson access to a group of students
- Teacher can grant access to an individual student
- Teacher can schedule lesson access to unlock at specific times (aligned with
  class schedule / drip)
- Priority: group rule → individual override → scheduled unlock

**Platform roles & hierarchy:**
- Student / public user
- Teacher — can build courses, manage their own students, set class times
- Academy Manager — is ALSO a teacher themselves (dual role), can:
    - Add/invite other teachers to their academy
    - Enable or disable specific features per their academy:
        * One-time enrollment (on/off)
        * Subscription access (on/off)
        * Live class system (on/off)
    - See unified student + revenue data across all teachers in the academy
    - Control which features their teachers can use
- Platform admin (us)

**Key behavior:**
- A manager running a small solo academy = acts as teacher + manager simultaneously
- A manager running a large academy = delegates teaching to their teachers
- Feature toggles are set at the academy level by the manager — teachers cannot override
- A teacher inside an academy operates within the feature set their manager enabled

---

## MONETIZATION MODEL

- We sell the platform to teachers/academies (B2B SaaS)
- Zero commission on all packages EXCEPT the cheapest/starter tier for small
  businesses — on that tier we take a commission per student enrollment
- Larger packages pay a flat monthly/annual fee with zero commission

**Proposed tiers (rough):**
- Starter: cheapest, commission-based per enrollment
- Growth: flat fee, zero commission, individual teacher
- Pro/Academy: flat fee, zero commission, multi-teacher, academy features
- Enterprise: white-label, custom pricing

---

## OPEN QUESTIONS I NEED YOU TO ANALYZE

Please analyze the following and give concrete, actionable recommendations:

### 1. Business model validation
- Is the commission-on-starter model a good idea, or does it create friction/churn?
- What commission % is standard in this space? What flat fee pricing is competitive?
- Should subscriptions and bundles be gated to certain tiers only?
- How should teacher payouts work (Stripe Connect, manual, etc.)?

### 2. Pricing strategy
- Suggest a specific pricing table with tier names, monthly prices, annual
  discount %, and key feature gates
- What features should be the "upgrade triggers" that push users from Starter → Growth → Pro?
- Should we offer a free trial or freemium? What duration/limits?

### 3. Product positioning & differentiation
- How do we position against Teachable, Kajabi, Thinkific, and Podia?
- What is our sharpest differentiator given the live class + lesson access control features?
- Who is the ideal customer profile (ICP) we should target first?

### 4. Go-to-market strategy
- What acquisition channels work best for this ICP?
- Should we launch in a specific niche before going broad?
- What does a realistic 6-month launch plan look like?

### 5. Website strategy
- What pages does our marketing site need?
- What is the ideal homepage structure (hero → sections → CTA flow)?
- What social proof, messaging, and CTAs convert best for this audience?
- Should the site target teachers, academies, or both — and how?

### 6. Feature prioritization for MVP
- Given the full scope above, what is the absolute minimum feature set to launch?
- What should be deferred to v2/v3?
- What feature gaps might we be missing that competitors offer and users expect?

### 7. Academy configuration & permission model
- Is per-academy feature toggling a strong selling point or does it add UX complexity?
- Should feature toggles be visible to teachers, or silently enforced?
- When a manager acts as a teacher, should their views be separate dashboards or unified with role switching?
- Should teachers inside an academy be able to have their own independent presence outside the academy?

---

## CONSTRAINTS & CONTEXT
- The platform is in development (not yet launched)
- Primary market is likely MENA / Europe (but not limited)
- We want to avoid being a marketplace (zero commission long-term except starter tier)
- The platform should feel premium and trustworthy, not cheap

---

Please structure your response with clear headers for each of the 7 areas above.
Be specific — give numbers, examples, competitor references, and concrete
recommendations rather than generic advice. Where there are genuine trade-offs,
explain them clearly so I can make an informed decision.
```

---

## 11. Legal & IP Protection Steps

### Priority Order

1. **Register your domain today** (~$10–15/year on Namecheap, Cloudflare Registrar)
2. **Grab all social handles** (X, LinkedIn, Instagram, Product Hunt)
3. **Register your company** (your country or UAE Free Zone — RAKEZ, Dubai Silicon Oasis ~$1,500–3,000/year)
4. **File trademark via WIPO Madrid System** (madrid.wipo.int) — one application covers 130+ countries (~$250–1,000+). Do this once you have a final brand name.
5. **Keep code in private version-controlled repos** from day one (GitHub timestamps = legal evidence)

### What You Should Know

- **Ideas cannot be legally owned** anywhere in the world — what you protect is the expression (code, brand, content)
- **Copyright is automatic** — your code and designs are protected the moment you create them (Berne Convention, 181 countries). No registration needed, but document creation dates.
- **Timestamps matter** — use Bernstein (bernstein.io) or IPArchive for cryptographic timestamps on concept documents
- **Company registration** is the most underrated protection — ties all IP to a legal owner

---

_Document saved from Claude.ai planning session_
