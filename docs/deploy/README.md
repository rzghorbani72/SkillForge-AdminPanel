# AdminPanel deployment (Hamravesh / Darkube)

The panel is served at `panel-academy.darkube.ir` and optionally `admin.mentoma.ir` (same deployment). Production domain is **mentoma.ir** — do not point rewrites at `mentoma.com`.

## Build-time env (required)

Copy `panel-academy.env.example` into Hamravesh build args. **`BACKEND_API_URL` must use `/v1`**, not legacy `/api`, or `/fa/v1/*` login and API calls return 500.

After changing build args, **rebuild the image** — runtime env alone does not update Next.js rewrites.

## Troubleshooting: `DEPTH_ZERO_SELF_SIGNED_CERT`

If panel logs show:

```
Failed to proxy https://api.mentoma.com/fa/v1/auth/staff/login
Error: self-signed certificate { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' }
```

The image was built with **`BACKEND_API_URL=https://api.mentoma.com/...`** (wrong TLD). Node rejects that host’s self-signed TLS cert.

**Fix:** rebuild with one of these (never `api.mentoma.com`):

- `https://api-academy.darkube.ir/v1` — recommended for Hamravesh panel → API (same cluster, valid cert)
- `https://api.mentoma.ir/v1` — public API on mentoma.ir

Do **not** disable TLS verification (`NODE_TLS_REJECT_UNAUTHORIZED=0`).

## Verify after deploy

```bash
curl -sS 'https://panel-academy.darkube.ir/fa/v1/auth/staff/login' \
  -X POST -H 'Content-Type: application/json' \
  --data '{"identifier":"+98...","password":"..."}'
```

Expect HTTP 200 or 401, not `Internal Server Error`.
