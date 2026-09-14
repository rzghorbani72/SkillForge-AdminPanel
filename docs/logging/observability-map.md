# Observability map — which data goes where

| Question                                                   | Data                                                                                                                                                   | Tool                                                            | Retention                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------- | ---------- |
| Is it broken / slow?                                       | Structured logs (`event.action` JSON lines), `Http.RequestCompleted`, `Http.SlowRequest`, `Db.SlowQuery`                                               | Hamravesh log collector → Grafana (`                            | json`); Minio exporter for archive | days–weeks |
| What broke, with a stack trace?                            | Exceptions, Web Vitals, traces (10% sample), session replay on error                                                                                   | Sentry (`api`, `admin-panel`, `website` projects)               | Sentry plan                        |
| Where do users get stuck (product funnel)?                 | The SAME structured log events (`Onboarding.SetupStepOpened`, `Payments.CheckoutStarted`, `Auth.QuickSignupCompleted`, …), counted per step in Grafana | Grafana panels over the log pipe — no separate analytics vendor | days–weeks (log retention)         |
| Where do public-site visitors drop off (marketing funnel)? | Page views, clicks, heatmaps, session replay on the PUBLIC pages only, after GDPR consent                                                              | GA4 + Microsoft Clarity (edusphere only, never AdminPanel)      | Google/Clarity's own retention     |
| What is the business doing?                                | Postgres truth + immutable month-end `MetricSnapshot` ledger (`/platform-metrics/*`, data-room export)                                                 | AdminPanel platform metrics + Metabase (read-only role)         | forever                            |

Every layer shares the same identity keys — `request_id`, `academy_id`,
`user_id`, `role` — so a Sentry error, its log lines, and the tenant's revenue
row can be joined by hand.

Rules:

- Logs are never the source of business numbers — Postgres is.
- **Product-usage funnels reuse the existing structured log events — no
  ClickHouse/Kafka/PostHog.** At this scale (dozens of academies, not millions
  of events), LogQL counts per `(event, action)` answer "where do managers/
  students drop off" well enough; see the "Product funnel" dashboard.
- GA4/Clarity are marketing tools for the **public, pre-login** pages only —
  they never see anything behind auth, and never fire before GDPR consent.
- Nothing personal (email, phone, names) goes into any of these pipes.
