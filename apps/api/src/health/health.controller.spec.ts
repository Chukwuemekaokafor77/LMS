import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthCheckError } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { redisConnectionFromUrl } from "../redis/redis-connection";

/**
 * The behaviour under test is a judgement call that is easy to "tidy" into a
 * bug later, so it is pinned here: Redis must be VISIBLE on the platform probe
 * but must not be able to FAIL it.
 *
 * On 2026-09-09 the queue's Redis was deleted. `/health` only checked Postgres,
 * so DigitalOcean reported the app healthy for weeks while every certificate,
 * invitation and materialization silently failed. Adding Redis as a fatal
 * check would have swapped that for a worse failure: the readiness probe would
 * kill the container, and since startup itself needs Redis nothing could
 * replace it and no deploy could ship.
 */

const up = (key: string) => ({ [key]: { status: "up" as const } });
const down = (key: string, error: string) => ({
  [key]: { status: "down" as const, error },
});

/** Minimal stand-in for HealthCheckService: runs the indicators the way
 *  Terminus does — collect results, and fail the whole check if one throws. */
const makeHealth = () => ({
  check: vi.fn(async (indicators: Array<() => Promise<unknown>>) => {
    const details: Record<string, unknown> = {};
    const errors: Record<string, unknown> = {};
    for (const fn of indicators) {
      try {
        Object.assign(details, await fn());
      } catch (err) {
        const causes = (err as HealthCheckError).causes as Record<
          string,
          unknown
        >;
        Object.assign(errors, causes ?? {});
        Object.assign(details, causes ?? {});
      }
    }
    const status = Object.keys(errors).length ? "error" : "ok";
    return { status, info: details, error: errors, details };
  }),
});

describe("HealthController", () => {
  let health: ReturnType<typeof makeHealth>;
  let prismaIndicator: { pingCheck: ReturnType<typeof vi.fn> };
  let redis: { check: ReturnType<typeof vi.fn> };
  let controller: HealthController;

  beforeEach(() => {
    health = makeHealth();
    prismaIndicator = {
      pingCheck: vi.fn(async () => up("database")),
    };
    redis = { check: vi.fn(async () => up("redis")) };
    controller = new HealthController(
      health as never,
      prismaIndicator as never,
      {} as never,
      redis as never,
    );
  });

  describe("GET /health — the platform readiness probe", () => {
    it("reports both dependencies when everything is up", async () => {
      const res = await controller.check();
      expect(res.status).toBe("ok");
      expect(res.details).toMatchObject({
        database: { status: "up" },
        redis: { status: "up" },
      });
    });

    it("STAYS OK when Redis is down, and still says so", async () => {
      redis.check.mockResolvedValue(down("redis", "ENOTFOUND"));

      const res = await controller.check();

      // The whole point: visible, but not fatal. If this flips to "error",
      // a Redis outage starts killing containers and blocking deploys.
      expect(res.status).toBe("ok");
      expect(res.details.redis).toMatchObject({
        status: "down",
        error: "ENOTFOUND",
      });
    });

    it("fails when Postgres is down — the API cannot serve without it", async () => {
      prismaIndicator.pingCheck.mockRejectedValue(
        new HealthCheckError("db down", down("database", "connection refused")),
      );

      const res = await controller.check();

      expect(res.status).toBe("error");
      expect(res.error).toHaveProperty("database");
    });
  });

  describe("GET /health/deps — the monitoring endpoint", () => {
    it("is ok when every dependency is up", async () => {
      const res = await controller.deps();
      expect(res.status).toBe("ok");
    });

    it("FAILS when Redis is down — this is what alerting watches", async () => {
      redis.check.mockResolvedValue(down("redis", "ENOTFOUND"));

      const res = await controller.deps();

      expect(res.status).toBe("error");
      expect(res.error).toHaveProperty("redis");
    });

    it("surfaces the reason Redis was unreachable", async () => {
      redis.check.mockResolvedValue(
        down("redis", "getaddrinfo ENOTFOUND valued-raptor-190386.upstash.io"),
      );

      const res = await controller.deps();

      expect(JSON.stringify(res.error)).toContain("ENOTFOUND");
    });
  });
});

describe("redisConnectionFromUrl", () => {
  // Shared by QueueModule and the health indicator. If these two ever connect
  // differently, the health check stops describing the queue.
  it("enables TLS for rediss:// (DO Managed Valkey, Upstash)", () => {
    const opts = redisConnectionFromUrl(
      "rediss://default:pw@eldercare-cache-do-user-1-0.j.db.ondigitalocean.com:25061",
    );
    expect(opts).toMatchObject({
      host: "eldercare-cache-do-user-1-0.j.db.ondigitalocean.com",
      port: 25061,
      username: "default",
      password: "pw",
      tls: { rejectUnauthorized: false },
    });
  });

  it("leaves TLS off for plain redis://", () => {
    const opts = redisConnectionFromUrl("redis://localhost:6379");
    expect(opts.tls).toBeUndefined();
    expect(opts).toMatchObject({ host: "localhost", port: 6379 });
  });

  it("defaults the port to 6379 when the URL omits it", () => {
    expect(redisConnectionFromUrl("redis://localhost").port).toBe(6379);
  });

  it("percent-decodes credentials", () => {
    // DO-generated passwords routinely contain characters that must be encoded
    // in a URL; connecting with the raw escaped form fails auth.
    const opts = redisConnectionFromUrl(
      "rediss://us%40er:p%40ss%2Fword@host:25061",
    );
    expect(opts.username).toBe("us@er");
    expect(opts.password).toBe("p@ss/word");
  });
});
