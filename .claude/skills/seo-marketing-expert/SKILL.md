---
name: seo-marketing-expert
description: Use when writing or reviewing pricing-page copy, plan/feature naming, a trial or upgrade prompt, or any manager-facing marketing text in this app. AdminPanel is a private, unindexed surface -- for public-site SEO and acquisition copy, that work happens in ../edusphere's seo-marketing-expert.
---

# Marketing Copy Expert — AdminPanel

AdminPanel is a **private, authenticated** surface — no SEO applies here. This skill covers the marketing-adjacent copy that does live in this app: pricing pages, plan comparison, upgrade prompts, trial banners, and platform-owner pricing tools. Public-site SEO and acquisition copy live in `../edusphere`'s `seo-marketing-expert` skill.

## Who

The manager already signed up — this copy isn't acquisition, it's **retention and expansion**. They feel: is this worth what I'm paying, what happens if I don't upgrade, what happens if I stop paying. Answer plainly.

## Positioning — do not drift

An **Academy Operating System**, not an LMS/course platform — even internal copy (empty states, tooltips, upgrade prompts) should read as "runs your academy," not "make a course."

Load-bearing claims, in order: (1) **0% commission** — student money goes to the academy in full; (2) their own brand, their own site; (3) no developer needed. Never claim a ranking/revenue outcome, unshipped features, or enterprise scale.

## Copy rules

- No hardcoded user-facing strings — route through `lib/i18n`, keep the locked Persian vocabulary (memory `adminpanel-fa-naming-conventions`: `دانشجو`, `اشتراک آکادمی` vs `پلن‌های دانشجو`, `مشخصات آکادمی`).
- Persian first, native phrasing, short sentences, the manager's own words — not software vocabulary.
- Objections are content: what happens at trial end, what happens on a lapsed plan (read-only, nothing deleted — never say "data is safe" without also saying exactly what "safe" means), refund policy (there are no refunds — say it plainly, don't bury it).

## Pricing communication

Prices, plan tiers, and the margin rule are validated in `docs/project-context.md` — don't redesign them, and never hardcode a price in a component (read from the live plan data). Quarterly is **pay once, fewer renewals** (5% off), never framed as a discount war. Renewals in Iran are **initiated, not auto-charged** (no card-on-file) — an upgrade/renewal prompt must not imply silent auto-billing.

## Trial and upgrade prompts

One 14-day trial per creator manager, not per academy — a prompt inviting a second academy must not imply a second trial. Upgrade triggers are the real plan limits enforced in code (teachers, courses, storage GB, tutoring-student seats) — a prompt should name the actual limit hit, not a vague "upgrade for more."

## Business framing

Priorities: fast validation > revenue > simplicity (`docs/project-context.md`). Copy work that doesn't plausibly move a manager toward staying subscribed or upgrading is low priority.
