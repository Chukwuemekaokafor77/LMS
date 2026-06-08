FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable

# ── Build stage ─────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @maple-care/api exec prisma generate
RUN pnpm --filter @maple-care/api build

# ── Production stage ────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app and dependencies
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
