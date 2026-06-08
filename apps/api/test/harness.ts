import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { ClerkService } from "../src/auth/clerk.service";
import { S3Service } from "../src/storage/s3.service";
import { MuxService } from "../src/video/mux.service";
import { tenantScopeMiddleware } from "../src/tenant/tenant-scope.middleware";

/**
 * Boots the *real* app for the cross-tenant e2e suite (LMS-C1): real Postgres +
 * Redis, the real tenant-scope middleware + Clerk guard + Prisma guardrail. Only
 * the three services that do real network/crypto I/O are stubbed:
 *
 *   - ClerkService — auth bypass: the bearer token *is* the clerkUserId, so the
 *     real guard resolves the seeded Staff and sets the org context. This is
 *     what exercises the H1 request→context→guardrail chain end-to-end.
 *   - S3Service / MuxService — return canned values so cert-download and video
 *     playback don't need real AWS/Mux credentials.
 *
 * Everything else (controllers, services, PrismaService + the tenant extension)
 * is the production wiring.
 */

// Dummy config so every getOrThrow at module init succeeds. DATABASE_URL and
// REDIS_URL are the only ones that must be real (Prisma + BullMQ connect).
function setDummyEnv() {
  const dummies: Record<string, string> = {
    CLERK_SECRET_KEY: "sk_test_dummy",
    CLERK_WEBHOOK_SECRET: "whsec_dummy",
    AWS_REGION: "ca-central-1",
    AWS_S3_BUCKET: "test-bucket",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    MUX_TOKEN_ID: "test",
    MUX_TOKEN_SECRET: "test",
    MUX_WEBHOOK_SECRET: "test",
    MUX_SIGNING_KEY_ID: "test",
    RESEND_API_KEY: "re_test",
    STRIPE_SECRET_KEY: "sk_test_dummy",
    STRIPE_PRICE_PER_SEAT_ID: "price_test",
    EMAIL_FROM: "test@example.com",
    WEB_BASE_URL: "http://localhost:3000",
  };
  for (const [k, v] of Object.entries(dummies)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

const clerkStub = {
  verifyBearer: async (token: string) => ({ sub: token, sid: "test-session" }),
  getClient: () => {
    throw new Error("ClerkService.getClient is not stubbed for tests");
  },
};

const s3Stub = {
  presignGet: async (key: string) => `https://signed.example/get/${key}`,
  presignPut: async (key: string) => `https://signed.example/put/${key}`,
  getObjectBytes: async () => Buffer.from(""),
  putObject: async (key: string) => key,
};

const muxStub = {
  signPlayback: () => "test-token",
  verifyWebhook: () => true,
  get client() {
    throw new Error("MuxService.client is not stubbed for tests");
  },
};

type AuthedRequests = {
  get: (url: string) => request.Test;
  post: (url: string) => request.Test;
  delete: (url: string) => request.Test;
};

export type TestApp = {
  app: INestApplication;
  /** Request builders authenticated as the staff with this clerkUserId. */
  as: (clerkUserId: string) => AuthedRequests;
  /** Request builders with no auth header. */
  anon: () => AuthedRequests;
};

export async function setupTestApp(): Promise<TestApp> {
  setDummyEnv();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ClerkService)
    .useValue(clerkStub)
    .overrideProvider(S3Service)
    .useValue(s3Stub)
    .overrideProvider(MuxService)
    .useValue(muxStub)
    .compile();

  const app = moduleRef.createNestApplication();
  // Mirror main.ts exactly.
  app.use(tenantScopeMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const withAuth = (auth?: string): AuthedRequests => {
    const server = () => request(app.getHttpServer());
    const apply = (t: request.Test) => (auth ? t.set("Authorization", auth) : t);
    return {
      get: (url) => apply(server().get(url)),
      post: (url) => apply(server().post(url)),
      delete: (url) => apply(server().delete(url)),
    };
  };

  return {
    app,
    as: (clerkUserId: string) => withAuth(`Bearer ${clerkUserId}`),
    anon: () => withAuth(),
  };
}
