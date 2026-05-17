# Hamravesh mirrors (Iran): npm https://repo.hmirror.ir/npm
FROM node:22-bookworm-slim AS base

ENV NPM_REGISTRY=https://repo.hmirror.ir/npm/
ENV NEXT_TELEMETRY_DISABLED=1
ENV npm_config_registry=${NPM_REGISTRY}
ENV NPM_CONFIG_REGISTRY=${NPM_REGISTRY}

RUN corepack enable \
  && corepack prepare pnpm@9 --activate \
  && npm config set registry "${NPM_REGISTRY}" \
  && pnpm config set registry "${NPM_REGISTRY}" \
  && pnpm config set fetch-retries 5 \
  && pnpm config set fetch-retry-mintimeout 20000 \
  && pnpm config set fetch-retry-maxtimeout 120000 \
  && pnpm config set network-timeout 600000

WORKDIR /app

FROM base AS deps

ENV HUSKY=0

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm config get registry \
  && pnpm install --frozen-lockfile --registry "${NPM_REGISTRY}"

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HOST
ARG NEXT_PUBLIC_BACKEND_API_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_HOST=${NEXT_PUBLIC_HOST}
ENV NEXT_PUBLIC_BACKEND_API_URL=${NEXT_PUBLIC_BACKEND_API_URL}

RUN pnpm run build

FROM base AS runner

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 4000
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||4000)+'/',(r)=>process.exit(r.statusCode&&r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
