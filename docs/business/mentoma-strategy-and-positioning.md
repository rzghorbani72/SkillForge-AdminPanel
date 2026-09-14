# Mentoma — Strategy, Positioning & Execution Pillars

> Source: a founder ↔ co-founder strategy session. This document captures the positioning, the moat analysis, the global ambition, the investor Q&A, and the non-negotiable execution pillars that the product must deliver for the story to be true.
>
> منبع: یک جلسهٔ استراتژی میان بنیان‌گذار و هم‌بنیان‌گذار. این سند، جایگاه‌سازی، تحلیلِ خندق، جاه‌طلبیِ جهانی، پرسش‌وپاسخِ سرمایه‌گذار، و ستون‌های اجراییِ غیرقابل‌مذاکره را که محصول باید تحویل دهد تا داستان واقعی باشد، ثبت می‌کند.

---

# English

## 1. Positioning

Mentoma is an **Academy Operating System**, not an LMS or a course platform.

- **Why the label matters:** the word you use puts you in a category with fixed expectations and a reference price. "LMS" → cheap school IT (Moodle). "Course platform" → content creation (Teachable). "Academy Operating System" → runs the whole business, premium, new category.
- **Differentiation:** operations, not content creation. Course creation is a required feature, not the reason anyone buys.
- **Buyer:** the academy **manager** (3–15 teachers), not the teacher and not the student.

## 2. Market Path — Beachhead, Not Destination

- **MENA (Iran-first) is the beachhead:** fast, cheap, unserved. It lets us prove the product, build the data moat, and reach profitability with little capital.
- **The real goal is Europe / US:** bigger budgets, the same underserved segment.
- **Honest transfer analysis:** local payment rails and language **do not** transfer — they are beachhead advantages, not global moats. What transfers: product maturity, the data-moat playbook, unit economics, and a low cost base to undercut Western incumbents.

## 3. The Moats (ranked honestly)

| Item                                                                             | Type                                       | Travels globally? |
| -------------------------------------------------------------------------------- | ------------------------------------------ | ----------------- |
| Learning-data switching cost                                                     | **Real moat**                              | ✅ Universal      |
| Underserved small-academy wedge (too big for creators, too small for enterprise) | **Real moat / wedge**                      | ✅ Yes            |
| Capital efficiency (built lean)                                                  | **Advantage**                              | ✅ Yes            |
| "Operating System" naming                                                        | Positioning, not defensibility             | —                 |
| Multi-tenant / white-label                                                       | Table stakes (any competitor can build it) | —                 |
| Region-native (fa/RTL, local rails)                                              | Beachhead advantage only                   | ❌ Local          |

**Strongest moat = the learning-data switching cost.** Every quiz, grade, submission, feedback, and attendance record accumulates, so leaving gets more painful over time. This is universal and is what we sell to investors.

## 4. Revenue Model

- Tiered plans, **subscription only, 0% commission**: Starter (900k Toman/mo) → Growth (2.5M) → Business (5.9M). Yearly billing includes two months free.
- **One 14-day trial per creator manager** — once per person, same length on every plan — then paid. There is no free-forever tier, and a second academy does not earn a second trial.
- Plan limits (teachers, courses, **storage GB**) enforced in code → natural upgrade triggers. Storage is the only usage-based lever, billed as per-GB overage on renewal.
- Land small, expand automatically as the academy grows. Same tiers carry higher willingness-to-pay in the West.
- Iran reality: no card-on-file (PayPing), so renewals are **initiated, not auto-charged**. Stripe in phase two enables true auto-renewal.

## 5. Investor Q&A (the questions that decide the raise)

1. **Why now / what's the opportunity?** Small academies underserved everywhere; just went digital, no OS built for them.
2. **Why start in MENA?** Beachhead — fast, cheap, unserved; earns the right to attack the West with a proven product.
3. **What transfers to the West?** Product, data-moat playbook, unit economics, low cost base — not language/payment rails.
4. **Why won't Teachable/Kajabi/Teachworks crush you?** They serve solo creators or big institutions; the multi-teacher academy is orphaned. Go vertical (language / exam-prep) + switching-cost moat.
5. **Where's the moat?** Learning-data switching cost (universal).
6. **How do you make money / does it grow with the customer?** Subscription tiers + storage overage + code-enforced upgrade triggers (teachers, courses, GB). No commission — expansion comes from tier upgrades, not from taking a cut of their revenue, which also keeps us out of the aggregator tax trap.
7. **Iran-rooted company selling to the West — how?** Clean Western structure (US Delaware C-corp or EU entity), Stripe, EUR/USD, GDPR from day one of phase two. Iran stays as beachhead + low-cost build base.
8. **Solo founder — what about a team?** Built solo to validate PMF cheaply; modular/tested/documented code; first hires = backend engineer + customer-success/sales to remove key-person risk.
9. **CAC — can you afford the West?** Low CAC in MENA; in the West use low-CAC channels (vertical communities, partnerships, referral loop), not paid-ad wars with giants.
10. **The one number that proves it works?** **Retention** (3- and 6-month) — the leading indicator that the moat is real.

**The two questions that actually decide a Western raise:** #7 (corporate structure) and #10 (a real retention number). Don't pitch without both prepared.

## 6. Execution Pillars — Must Be Perfect

The pitch makes promises; these are the promises where "90% done" = "failed", because one breach destroys what was sold.

1. **Multi-tenant isolation — zero leaks, ever.** Enforced at the data layer, not UI; automated isolation tests; no endpoint returns another tenant's data.
2. **Learning record — complete, durable, never lost.** This _is_ the moat. Persisted, backed up, recoverable, full history per student over time.
3. **Money movement — flawless, auditable, no double-charge.** Idempotent handling, complete transaction audit trail, reconciliation that always balances.
4. **Access control & roles — right person, right data, always.** Server-side checks on every action; revoke/demote effective on the next request; least-privilege by default.
5. **Reliability / uptime — it's an OS; if it's down, their school stops.** Monitored, observable (structured logging/Grafana), graceful failure, fast recovery, job heartbeats.
6. **Time-to-value / onboarding simplicity — a manager goes live fast, alone.** Self-serve setup, guided empty states, nothing critical requires a developer.

**Obsess over #1 and #2 above all** — the first prevents a company-ending trust event; the second _is_ the moat. No acceptable failure rate on those two.

---

# فارسی

## ۱. جایگاه‌سازی (Positioning)

منتوما یک **سیستم‌عاملِ آکادمی** است، نه یک LMS و نه یک پلتفرمِ ساختِ دوره.

- **چرا برچسب مهم است:** کلمه‌ای که انتخاب می‌کنی تو را در دسته‌ای با انتظارات و قیمتِ مرجعِ ثابت قرار می‌دهد. «LMS» → نرم‌افزارِ ارزانِ مدرسه (مودل). «پلتفرمِ دوره» → تولیدِ محتوا (Teachable). «سیستم‌عاملِ آکادمی» → کلِ کسب‌وکار را اداره می‌کند، پریمیوم، دستهٔ جدید.
- **تمایز:** عملیات، نه تولیدِ محتوا. ساختِ دوره یک قابلیتِ لازم است، نه دلیلِ خرید.
- **خریدار:** **مدیرِ** آکادمی (۳ تا ۱۵ معلم)، نه معلم و نه دانشجو.

## ۲. مسیرِ بازار — سرِپل، نه مقصد

- **خاورمیانه (ایران‌اول) سرِپل است:** سریع، ارزان، بی‌رقیب. اجازه می‌دهد محصول را اثبات کنیم، خندقِ داده بسازیم و با سرمایهٔ کم به سوددهی برسیم.
- **هدفِ واقعی اروپا/آمریکاست:** بودجه‌های بزرگ‌تر، همان بخشِ بی‌سرویس.
- **تحلیلِ صادقانهٔ انتقال:** درگاهِ پرداختِ محلی و زبان **منتقل نمی‌شوند** — این‌ها مزیتِ سرِپل‌اند، نه خندقِ جهانی. آنچه منتقل می‌شود: بلوغِ محصول، نسخهٔ اجراییِ خندقِ داده، اقتصادِ واحد، و ساختارِ هزینهٔ پایین برای زدنِ زیرِ قیمتِ رقبای غربی.

## ۳. خندق‌ها (با صداقت رتبه‌بندی‌شده)

| مورد                                                    | نوع                           | جهانی منتقل می‌شود؟ |
| ------------------------------------------------------- | ----------------------------- | ------------------- |
| هزینهٔ مهاجرتِ ناشی از دادهٔ یادگیری                    | **خندقِ واقعی**               | ✅ جهانی            |
| شکافِ آکادمیِ کوچک (برای سازنده بزرگ، برای سازمان کوچک) | **خندق/گوه**                  | ✅ بله              |
| بهره‌وریِ سرمایه (ساختِ کم‌هزینه)                       | **مزیت**                      | ✅ بله              |
| نام‌گذاریِ «سیستم‌عامل»                                 | جایگاه‌سازی، نه دفاع          | —                   |
| چندمستأجری / وایت‌لیبل                                  | بلیتِ ورود (هر رقیبی می‌سازد) | —                   |
| بومیِ منطقه (فارسی/راست‌چین، درگاهِ محلی)               | فقط مزیتِ سرِپل               | ❌ محلی             |

**قوی‌ترین خندق = هزینهٔ مهاجرتِ دادهٔ یادگیری.** هر آزمون، نمره، تکلیف، بازخورد و حضور جمع می‌شود، پس رفتن با گذرِ زمان دردناک‌تر می‌شود. این جهانی است و همان چیزی است که به سرمایه‌گذار می‌فروشیم.

## ۴. مدلِ درآمدی

- پلن‌های پلکانی، **فقط اشتراکی و بدون کمیسیون (۰٪)**: استارتر (۹۰۰ هزار تومان ماهانه) → رشد (۲٫۵ میلیون) → بیزینس (۵٫۹ میلیون). در پرداخت سالانه دو ماه رایگان است.
- **یک دورهٔ آزمایشیِ ۱۴ روزه برای هر مدیرِ سازنده** — یک‌بار برای هر شخص و با همان طول در همهٔ پلن‌ها؛ سپس پرداختی. پلنِ همیشه‌رایگان وجود ندارد و آکادمیِ دوم دورهٔ آزمایشیِ تازه نمی‌گیرد.
- محدودیت‌های پلن (معلم، دوره، فضا) در کد اعمال می‌شوند → نقاطِ ارتقای طبیعی.
- کوچک شروع کن، با رشدِ آکادمی خودکار گسترش بده. همین پلن‌ها در غرب تمایلِ پرداختِ بالاتری دارند.
- واقعیتِ ایران: کارت‌ذخیره‌شده نداریم (پی‌پینگ)، پس تمدید **آغاز می‌شود، نه خودکار کسر**. Stripe در فازِ دوم تمدیدِ خودکارِ واقعی را ممکن می‌کند.

## ۵. پرسش‌وپاسخِ سرمایه‌گذار (سؤالاتی که سرنوشتِ جذبِ سرمایه را تعیین می‌کنند)

۱. **چرا الان / فرصت چیست؟** آکادمی‌های کوچک همه‌جا بی‌سرویس‌اند؛ تازه دیجیتال شده‌اند و سیستم‌عاملی برایشان ساخته نشده.
۲. **چرا از خاورمیانه شروع می‌کنید؟** سرِپل — سریع، ارزان، بی‌رقیب؛ حقِ حمله به غرب با محصولِ اثبات‌شده را می‌سازد.
۳. **چه چیزی به غرب منتقل می‌شود؟** محصول، نسخهٔ اجراییِ خندقِ داده، اقتصادِ واحد، هزینهٔ پایین — نه زبان/درگاه.
۴. **چرا Teachable/Kajabi/Teachworks شما را له نمی‌کنند؟** آن‌ها به سازندهٔ تک‌نفره یا مؤسساتِ بزرگ سرویس می‌دهند؛ آکادمیِ چندمعلمه رها شده. عمودی برو (زبان/آمادگیِ آزمون) + خندقِ هزینهٔ‌مهاجرت.
۵. **خندق کجاست؟** هزینهٔ مهاجرتِ دادهٔ یادگیری (جهانی).
۶. **چطور پول درمی‌آورید / با مشتری رشد می‌کند؟** حق اشتراک پلکانی + هزینهٔ فضای مازاد + نقاطِ ارتقای اعمال‌شده در کد (معلم، دوره، گیگابایت). بدون کمیسیون — رشد درآمد از ارتقای پلن می‌آید، نه از برداشتن سهم از فروش آکادمی؛ این ما را از تلهٔ مالیاتی مدل تجمیعی هم دور نگه می‌دارد.
۷. **شرکتِ ریشه‌دار در ایران که به غرب می‌فروشد — چطور؟** ساختارِ تمیزِ غربی (C-corp دلاور یا شرکتِ اروپایی)، Stripe، یورو/دلار، GDPR از روزِ اولِ فازِ دوم. ایران به‌عنوان سرِپل و پایگاهِ ساختِ کم‌هزینه می‌ماند.
۸. **بنیان‌گذارِ تنها — تیم چه می‌شود؟** عمداً تنها ساختم تا PMF را ارزان اثبات کنم؛ کدِ ماژولار/تست‌دار/مستند؛ اولین استخدام‌ها = مهندسِ بک‌اند + فروش/موفقیتِ مشتری برای حذفِ ریسکِ فردِ کلیدی.
۹. **CAC — از پسِ غرب برمی‌آیید؟** CAC پایین در خاورمیانه؛ در غرب کانال‌های کم‌هزینه (جامعه‌های عمودی، مشارکت، حلقهٔ ارجاع)، نه جنگِ تبلیغاتیِ پولی با غول‌ها.
۱۰. **آن یک عددی که ثابت می‌کند جواب می‌دهد؟** **نگه‌داشت (Retention)** سه و شش‌ماهه — شاخصِ پیشروِ واقعی‌بودنِ خندق.

**دو سؤالی که واقعاً سرنوشتِ جذبِ سرمایهٔ غربی را تعیین می‌کنند:** شمارهٔ ۷ (ساختارِ شرکتی) و شمارهٔ ۱۰ (یک عددِ واقعیِ نگه‌داشت). بدونِ آمادگیِ هر دو وارد جلسه نشو.

## ۶. ستون‌های اجرایی — باید بی‌نقص باشند

پیچ وعده می‌دهد؛ این‌ها وعده‌هایی‌اند که «۹۰٪ انجام‌شده» در آن‌ها یعنی «شکست‌خورده»، چون یک رخنه همان چیزی را که فروختی نابود می‌کند.

۱. **ایزولاسیونِ چندمستأجری — هیچ‌وقت نشتی.** در لایهٔ داده اعمال شود نه رابطِ کاربری؛ تستِ خودکارِ ایزولاسیون؛ هیچ مسیری دادهٔ مستأجرِ دیگر را برنگرداند.
۲. **سابقهٔ یادگیری — کامل، ماندگار، هرگز گم‌نشده.** این _همان_ خندق است. ذخیره، پشتیبان، قابلِ‌بازیابی، تاریخچهٔ کاملِ هر دانشجو در طول زمان.
۳. **جابه‌جاییِ پول — بی‌نقص، قابلِ‌حسابرسی، بدونِ کسرِ مضاعف.** مدیریتِ idempotent، ردِ حسابرسیِ کاملِ تراکنش، مغایرت‌گیریِ همیشه‌تراز.
۴. **کنترلِ دسترسی و نقش‌ها — آدمِ درست، دادهٔ درست، همیشه.** بررسی در سمتِ سرور روی هر کنش؛ حذف/تنزل در درخواستِ بعدی اثر کند؛ کمترین‌دسترسیِ پیش‌فرض.
۵. **پایداری / در دسترس‌بودن — این سیستم‌عامل است؛ اگر بخوابد، آموزشگاهشان می‌خوابد.** مانیتورشده و قابلِ‌مشاهده (لاگینگِ ساختاریافته/گرافانا)، شکستِ کنترل‌شده، بازیابیِ سریع، ضربانِ سلامتِ جاب‌ها.
۶. **زمان تا ارزش / سادگیِ راه‌اندازی — مدیر سریع و تنها راه می‌افتد.** راه‌اندازیِ سلف‌سرویس، حالتِ خالیِ راهنما، هیچ‌چیزِ حیاتی به توسعه‌دهنده نیاز نداشته باشد.

**بیش از همه روی ۱ و ۲ وسواس داشته باش** — اولی از یک رخدادِ اعتمادیِ شرکت‌برانداز جلوگیری می‌کند؛ دومی _همان_ خندق است. برای این دو هیچ نرخِ خطای قابلِ‌قبولی وجود ندارد.
