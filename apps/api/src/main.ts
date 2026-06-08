import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { tenantScopeMiddleware } from "./tenant/tenant-scope.middleware";

async function bootstrap() {
  // rawBody: true makes req.rawBody available for Stripe/Mux/Clerk
  // signature verification while still parsing JSON normally.
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });

  // Open a tenant scope around every request *before* guards run, so the Clerk
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
