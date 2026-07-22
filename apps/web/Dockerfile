FROM node:20-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
# NEXT_PUBLIC_* are inlined into the client bundle at build time. DO App Platform
# passes BUILD_TIME env vars as Docker --build-arg, so they must be declared as
# ARG and re-exported as ENV here or `next build` bakes `undefined` (→ the
# localhost fallback in the app). See .do/academy-web.app.yaml.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ELDERCARE_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ELDERCARE_APP_URL=$NEXT_PUBLIC_ELDERCARE_APP_URL
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @maple-care/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone mode copies only the necessary files for production
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Note: standalone mode structure puts the server entrypoint in apps/web/server.js
# if built within a monorepo.
CMD ["node", "apps/web/server.js"]
