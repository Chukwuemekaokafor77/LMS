FROM node:20-alpine AS base

# pnpm + openssl. Prisma's musl query/schema engines dynamically link libssl;
# without the openssl package Alpine can't load them ("engines not compatible").
RUN corepack enable && apk add --no-cache openssl

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

# Copy built app and dependencies. In a pnpm workspace the API's deps + the
# prisma CLI live in apps/api/node_modules (relative symlinks into the root
# .pnpm store), so BOTH trees are required for module resolution to work.
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 4000

# nest build emits to dist/src (no rootDir override), so the entry is dist/src/main.js.
CMD ["node", "apps/api/dist/src/main"]
