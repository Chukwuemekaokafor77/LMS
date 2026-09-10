import type { RedisOptions } from "ioredis";

/**
 * Single source of truth for turning `REDIS_URL` into ioredis connection
 * options.
 *
 * This lives on its own because it is used from two places — the BullMQ root
 * connection (QueueModule) and the Redis health indicator — and those two
 * MUST agree. A health check that connects differently from the queue is worse
 * than no health check at all: it reports green while the queue is down, or
 * red while the queue is fine.
 *
 * `rediss://` (DO Managed Valkey, Upstash, and the like) requires TLS. Because
 * we pass host/port rather than the URL itself, TLS has to be enabled
 * explicitly. `rejectUnauthorized: false` mirrors the `sslmode=require` posture
 * used against the same DO cluster family — encrypt in transit; the managed
 * cert is not in Node's CA bundle.
 */
export const redisConnectionFromUrl = (url: string): RedisOptions => {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username ? decodeURIComponent(u.username) : undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    ...(u.protocol === "rediss:"
      ? { tls: { rejectUnauthorized: false } }
      : {}),
  };
};
