# AdminPanel security

Hardening for SSRF, CSRF, host abuse, and Next.js server resource limits.

## Layers

| Layer       | File                   | What it does                                                                                |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| Next config | `next.config.ts`       | CSP, HSTS, rewrite target allowlist, image host allowlist, server action origin/body limits |
| Middleware  | `middleware.ts`        | Host allowlist, API rate limits, origin CSRF for `/api/*`, page auth                        |
| SSRF guards | `lib/security/ssrf.ts` | Backend URL/path validation for server-side `fetch`                                         |
| API proxy   | `lib/api-proxy.ts`     | Proxies only to trusted backend paths                                                       |

## Environment overrides

```env
SECURITY_ALLOWED_PANEL_HOSTS=admin.mentoma.ir,admin.mentoma.ir,panel-academy.darkube.ir
SECURITY_ALLOWED_BACKEND_HOSTS=api.mentoma.ir,api.mentoma.ir,api-academy.darkube.ir
SECURITY_MENTOMA_BASE_DOMAINS=mentoma.ir,mentoma.ir,darkube.ir
SECURITY_SERVER_ACTION_ORIGINS=https://admin.mentoma.ir,https://admin.mentoma.ir
```

## Defaults (production)

- **Panel hosts:** `admin.mentoma.ir`, `admin.mentoma.ir`, `panel-academy.darkube.ir`
- **Backend hosts:** `api.mentoma.ir`, `api.mentoma.ir`, `api-academy.darkube.ir`
- **Server actions:** 1 MB body limit, origin allowlist
- **API rate limits:** `/api/payment/*` 20/min, `/api/geolocation` 30/min, other `/api/*` 120/min per IP
- **CSRF (Next API routes):** mutating `/api/*` requires trusted `Origin`/`Referer` (webhooks like `/payment/saman-callback` are excluded)

## Local development

`localhost` and `127.0.0.1` are allowed for panel/backend hosts. CSP stays relaxed in development.

## Adding a new external fetch

1. Add the hostname to `lib/security/config.ts` (or env allowlist).
2. Call `assertAllowedExternalFetchUrl()` before `fetch`.
3. Never pass user-controlled URLs directly to server-side `fetch`.

## Adding a new backend proxy path

Use `buildTrustedBackendUrl('/your/path')` — paths must start with `/` and cannot contain `..` or protocols.
