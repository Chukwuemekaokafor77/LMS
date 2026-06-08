FROM node:20-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
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
