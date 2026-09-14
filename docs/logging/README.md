# Logging: Loki + Grafana

One flat JSON line per log, same shape everywhere. See the "Logging &
Observability" section of `CLAUDE.md` for the rules and
`docs/logging/log-index.md` for every event the platform can emit.

## Run locally

```bash
docker compose -f deploy/loki/docker-compose.yml up -d
cd Backend && LOKI_URL=http://localhost:3100 npm run start:dev
```

Grafana: http://localhost:3001 (admin / admin) → Explore → `{app="backend"}`.
The "Academy — Logs Overview" dashboard is provisioned automatically.

## Deploy on Hamravesh

1. Deploy `grafana/loki:3.4.x` as a normal service named `loki`, with
   `deploy/loki/loki-config.yaml` mounted at `/etc/loki/loki-config.yaml`
   (`-config.file=/etc/loki/loki-config.yaml`) and a 10–20 GB PVC at `/loki`.
   Do not expose it publicly; the apps reach it at `http://loki:3100`.
2. Set `LOKI_URL=http://loki:3100` and `RELEASE=<image tag>` on the Backend;
   `LOKI_URL` + `NEXT_PUBLIC_RELEASE` on AdminPanel and edusphere.
   If an app runs outside the namespace, put Loki behind a basic-auth ingress
   and set `LOKI_USER` / `LOKI_TOKEN`.
3. Add the one-click Grafana app; add a Loki datasource (`http://loki:3100`);
   import `deploy/grafana/dashboards/logs-overview.json` and
   `deploy/grafana/alerts.yaml`; set a Telegram/email contact point.

## Correlating a request

Every response carries `X-Request-Id`. Paste it into the dashboard's
`request_id` box or run `{app=~".+"} | json | request_id="<id>"` to see the
backend, panel and website lines of that one request.
