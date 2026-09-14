# Infrastructure, domains & design direction

## Production domains & routing

- Public domain: **mentoma.ir**. Academy subdomains: `*.mentoma.ir` (e.g. `apple.mentoma.ir`). Custom domains are supported per academy (`Domain.public_address`).
- Hamravesh (darkube) hosts are **staging**: `web-academy.darkube.ir` (edusphere), `api-academy.darkube.ir` (Backend), `panel-academy.darkube.ir` (AdminPanel).
- Cloudflare DNS: `@`/`www` → edusphere, `api` → Backend, `dashboard` → AdminPanel, `*` → edusphere (wildcard; **Proxy OFF** so the ACME DNS challenge can issue the wildcard cert).
- Reserved slugs blocked at app level: `www`, `api`, `dashboard`.

## Design & brand direction

- Position as an **Academy Operating System** — authoritative, structured, infrastructure feel; not classroom-cute.
- Marketing site: premium SaaS, scroll storytelling; RTL Persian first, English second.
- Logo: geometric mark; Latin **Mentoma** + Persian **منتوما**; readable at 32×32.
- Always meet WCAG AA; support light/dark tokens.
