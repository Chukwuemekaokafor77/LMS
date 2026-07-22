import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { tenantScopeMiddleware } from "./tenant/tenant-scope.middleware";

async function bootstrap() {
  // rawBody: true makes req.rawBody available for Mux webhooks
  // signature verification while still parsing JSON normally.
  const app = await NestFactory.create(AppModule, {
    // Restrict browser (CORS) access to the Academy web origin only — the client
    // components call this API cross-origin with a Bearer token. Server-to-server
    // callers (the ElderCare/Mux webhooks, DO health checks) send no Origin, so
    // this doesn't affect them. `cors: true` reflected any origin.
    cors: { origin: process.env.WEB_BASE_URL ?? "http://localhost:3000" },
    rawBody: true,
  });

  // Open a tenant scope around every request *before* guards run, so the auth
  // guard can populate orgId into it and the Prisma guardrail (LMS-H1) can read
  // it on every PHI query for the rest of the request. Must be the outermost
  // middleware. See tenant/tenant-scope.middleware.ts.
  app.use(tenantScopeMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}`);
}

bootstrap();
