import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import Redis from "ioredis";
import { redisConnectionFromUrl } from "../redis/redis-connection";

/** How long a PING may take before we call Redis unhealthy. */
const PING_TIMEOUT_MS = 2_000;

/**
 * Health indicator for the Redis/Valkey instance that backs BullMQ.
 *
 * Context (2026-09-10): the queue's Upstash instance was deleted and every
 * queue operation — issuing a certificate, inviting staff, materializing
 * assignments — failed for weeks, while `/health` kept returning 200 because it
 * only ever checked Postgres. Nothing alerted. This closes that hole.
 *
 * The client is deliberately configured to FAIL FAST rather than to be
 * resilient, because its only job is to answer "is Redis reachable right now":
 *  - `lazyConnect` so constructing the indicator cannot block app startup,
 *  - `enableOfflineQueue: false` so a PING rejects immediately instead of being
 *    buffered until a connection appears,
 *  - `maxRetriesPerRequest: 1` so a probe cannot inherit the 20-retry storm
 *    that filled the logs during the outage,
 *  - a capped `retryStrategy` so the client still reconnects on its own once
 *    Redis comes back, without hammering it.
 *
 * The `error` listener is not optional: an ioredis client with no error
 * listener turns a connection failure into an unhandled `error` event, which
 * would take the process down. Adding a health check must never be the thing
 * that crashes the app.
 */
@Injectable()
export class RedisHealthIndicator
  extends HealthIndicator
  implements OnModuleDestroy
{
  private readonly logger = new Logger(RedisHealthIndicator.name);
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {
    super();
  }

  private getClient(): Redis {
    if (this.client) return this.client;

    const url = this.config.getOrThrow<string>("REDIS_URL");
    this.client = new Redis({
      ...redisConnectionFromUrl(url),
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: PING_TIMEOUT_MS,
      retryStrategy: (times) => Math.min(times * 200, 5_000),
    });

    // Swallow-and-log: connection failures are the condition we are measuring,
    // not an exception to propagate. Without this the process dies.
    this.client.on("error", (err: Error) => {
      this.logger.debug(`Redis health client error: ${err.message}`);
    });

    return this.client;
  }

  /**
   * PINGs Redis. Throws nothing — callers decide whether "down" is fatal.
   * `/health` (the platform readiness probe) treats it as informational so a
   * Redis blip cannot kill the container; `/health/deps` treats it as fatal so
   * monitoring sees red. See HealthController.
   */
  async check(key = "redis"): Promise<HealthIndicatorResult> {
    try {
      const client = this.getClient();
      if (client.status === "end" || client.status === "wait") {
        await client.connect();
      }
      const pong = await Promise.race([
        client.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`PING timed out after ${PING_TIMEOUT_MS}ms`)),
            PING_TIMEOUT_MS,
          ),
        ),
      ]);
      return this.getStatus(key, pong === "PONG");
    } catch (err) {
      return this.getStatus(key, false, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      // `disconnect` rather than `quit`: quit round-trips to a server that may
      // be exactly the thing that is unreachable.
      this.client.disconnect();
      this.client = null;
    }
  }
}
