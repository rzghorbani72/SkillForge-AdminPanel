# Architecture — AdminPanel

Full business context: `docs/project-context.md`. This file is the technical map.

## System context

```mermaid
flowchart LR
  Manager[Manager/Teacher/Platform staff] -->|HTTPS| AP[AdminPanel :4000]
  AP -->|"same-origin /v1 rewrite"| API[Backend :3000]
  API --> PG[(PostgreSQL)]
  ED[edusphere :5000] -.->|"site-builder preview iframe"| AP
```

## Request flow: proxy.ts → page → API client → Backend

```mermaid
sequenceDiagram
  participant U as Browser
  participant PX as proxy.ts
  participant Pg as Page (Server/Client Component)
  participant API as lib/api.ts (apiClient)
  participant BE as Backend /v1

  U->>PX: GET /(protected)/courses
  PX->>PX: enforceTrustedHost → enforceApiRateLimit → enforceApiOriginCsrf
  PX->>PX: handlePageAuth: verify jwt cookie (jose), resolveSessionRole
  alt not authenticated
    PX-->>U: redirect /login?redirect=...
  else wrong role for this route
    PX-->>U: redirect to homeRouteFor(role)
  else ok
    PX->>Pg: render
    Pg->>API: apiClient.getCourses()
    API->>BE: fetch /v1/courses (same-origin, credentials:include, X-Academy-ID)
    BE-->>API: JSON (cookies carry auth)
    API-->>Pg: typed data
    Pg-->>U: rendered page
  end
```
`proxy.ts` is UX routing only — the Backend's own guards are the real authorization boundary (see Backend's `ARCHITECTURE.md`).

## Component layering

```mermaid
flowchart TB
  ui["components/ui (shadcn primitives)"] --> feature["components/&lt;domain&gt;/ (feature components)"]
  feature --> uitemplate["components/ui-template/ (site builder editor)"]
  feature --> pages["app/(protected)/&lt;domain&gt;/page.tsx"]
  pages --> layout["app/(protected)/layout.tsx"]
```

## Data layer

```mermaid
flowchart LR
  Page --> apiClient["lib/api.ts (apiClient)"]
  apiClient --> refresh["single-flight /auth/refresh on 401"]
  apiClient --> csrf["X-CSRF-Token via lib/csrf.ts"]
  apiClient --> academyHeader["X-Academy-ID via lib/browser-request-headers.ts"]
  apiClient -->|"same-origin /v1"| rewrite["Next rewrite (next.config.ts)"]
  rewrite --> Backend
  Page -.-> zustand["lib/store.ts (zustand) — client UI state"]
  Page -.-> reactQuery["@tanstack/react-query — server-state cache"]
```
Detail: `docs/frontend-data-layer.md`.

## i18n / RTL flow

```mermaid
flowchart LR
  Request --> detect["lib/i18n language-detector/sync"]
  detect --> provider["lib/i18n/provider.tsx"]
  provider --> translations["translations/{fa,en,ar,tr}.ts"]
  provider --> dir["dir=rtl for fa (logical CSS required)"]
```

## System design: exists / partial / planned

| Concern | Status | Where |
|---|---|---|
| Auth / session routing | Exists | `proxy.ts`, `lib/auth-routing.ts` |
| Same-origin API proxying | Exists | `next.config.ts` rewrites, `lib/api-base-url.ts` |
| Granular RBAC UI (hide by permission) | Partial | mirrors Backend's permission grid for the 7 controllers it covers; rest use role-only checks |
| Site builder / white-label editor | Exists | `components/ui-template/`, live preview into edusphere |
| i18n (fa/en/ar/tr) | Exists | `lib/i18n/` |
| Offline/PWA | Not built | not a current priority |
| Client-side error boundary reporting | Exists | Sentry (`sentry.*.config.ts`) |

## Owner map — update these docs when you touch these paths

| Change | Update |
|---|---|
| `proxy.ts` | Request-flow diagram above |
| `app/(protected)/<new-domain>/` (new route group) | Component layering + `ONBOARDING.md` folder map |
| `lib/api.ts` structure (or its split-up modules) | Data layer diagram |
| Auth/tenant handling (`lib/auth-routing.ts`, `lib/browser-request-headers.ts`) | Request-flow diagram |

Update `docs/ONBOARDING.md` too whenever a command, env var, or gotcha changes.
