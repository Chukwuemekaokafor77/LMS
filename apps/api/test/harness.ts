import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { IDENTITY_PROVIDER } from "../src/auth/identity-provider";
import { S3Service } from "../src/storage/s3.service";
import { MuxService } from "../src/video/mux.service";
import { tenantScopeMiddleware } from "../src/tenant/tenant-scope.middleware";

/**
 * Boots the *real* app for the cross-tenant e2e suite (LMS-C1): real Postgres +
 * Redis, the real tenant-scope middleware + auth guard + Prisma guardrail. Only
 * the services that do real network/crypto I/O are stubbed:
 *
 *   - IDENTITY_PROVIDER — auth bypass: the bearer token *is* the externalAuthId,
 *     so the real guard resolves the seeded Staff and sets the org context. This
 *     is what exercises the H1 request→context→guardrail chain end-to-end. Pass
 *     `stubIdentity: false` to drive the real AcademyIdentityProvider (the SSO
 *     spec does this so a minted session token authenticates for real).
 *   - S3Service / MuxService — return canned values so cert-download and video
 *     playback don't need real AWS/Mux credentials.
 *
 * Everything else (controllers, services, PrismaService + the tenant extension)
 * is the production wiring.
 */

// Stable webhook secret the Mux signature tests sign with.
export const TEST_MUX_WEBHOOK_SECRET = "mux_webhook_dummy_secret";

// Dummy config so every getOrThrow at module init succeeds. DATABASE_URL and
// REDIS_URL are the only ones that must be real (Prisma + BullMQ connect).
function setDummyEnv() {
  const dummies: Record<string, string> = {
    AWS_REGION: "ca-central-1",
    AWS_S3_BUCKET: "test-bucket",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    MUX_TOKEN_ID: "test",
    MUX_TOKEN_SECRET: "test",
    MUX_WEBHOOK_SECRET: TEST_MUX_WEBHOOK_SECRET,
    MUX_SIGNING_KEY_ID: "test",
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "test@example.com",
    WEB_BASE_URL: "http://localhost:3000",
    // Academy SSO: ELDERCARE_API_URL is deliberately left unset — the SSO
    // spec overrides AcademyExchangeClient, so no real ElderCare call is made.
    ACADEMY_SESSION_SECRET: "test-academy-session-secret",
    ACADEMY_EXCHANGE_SECRET: "test-academy-exchange-secret",
  };
  for (const [k, v] of Object.entries(dummies)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

// Identity bypass: the bearer token *is* the externalAuthId, so the real guard
// resolves the seeded Staff. Replaces the old ClerkService stub; keeps every
// existing `as(externalAuthId)` call working unchanged.
const identityProviderStub = {
  verifyBearer: async (token: string) => ({ externalId: token }),
  fetchProfile: async (externalId: string) => {
    throw new Error(`fetchProfile not stubbed (id ${externalId})`);
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
  patch: (url: string) => request.Test;
  put: (url: string) => request.Test;
  delete: (url: string) => request.Test;
};

export type TestApp = {
  app: INestApplication;
  /** Request builders authenticated as the staff with this externalAuthId. */
  as: (externalAuthId: string) => AuthedRequests;
  /** Request builders with no auth header. */
  anon: () => AuthedRequests;
};

export type ProviderOverride = { provide: unknown; useValue: unknown };

export type SetupOptions = {
  /** Stub MuxService (default true). Pass false to exercise real Mux webhook
   *  signature verification (the video playback test still uses the stub). */
  stubMux?: boolean;
  /** Stub the identity provider so bearer == externalAuthId (default true).
   *  Pass false to drive the real AcademyIdentityProvider (SSO spec). */
  stubIdentity?: boolean;
  /** Extra provider overrides (e.g. stub AcademyExchangeClient for the SSO
   *  spec so no real ElderCare call is made). */
  overrides?: ProviderOverride[];
};

export async function setupTestApp(opts: SetupOptions = {}): Promise<TestApp> {
  const { stubMux = true, stubIdentity = true, overrides = [] } = opts;
  setDummyEnv();

  let builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(S3Service)
    .useValue(s3Stub);
  if (stubIdentity) {
    builder = builder
      .overrideProvider(IDENTITY_PROVIDER)
      .useValue(identityProviderStub);
  }
  if (stubMux) {
    builder = builder.overrideProvider(MuxService).useValue(muxStub);
  }
  for (const o of overrides) {
    builder = builder.overrideProvider(o.provide).useValue(o.useValue);
  }
  const moduleRef = await builder.compile();

  // rawBody mirrors main.ts — the webhook controllers read req.rawBody.
  const app = moduleRef.createNestApplication({ rawBody: true });
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
      patch: (url) => apply(server().patch(url)),
      put: (url) => apply(server().put(url)),
      delete: (url) => apply(server().delete(url)),
    };
  };

  return {
    app,
    as: (externalAuthId: string) => withAuth(`Bearer ${externalAuthId}`),
    anon: () => withAuth(),
  };
}
