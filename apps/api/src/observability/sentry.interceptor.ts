import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import * as Sentry from "@sentry/node";

/**
 * Reports server-side failures (5xx / unexpected non-HTTP errors) to Sentry,
 * then rethrows so Nest's default exception handling produces the normal HTTP
 * response. Expected 4xx (validation / not-found / forbidden) are left alone —
 * they're normal traffic, not incidents. No-op when Sentry isn't initialised.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        const status =
          err instanceof HttpException ? err.getStatus() : 500;
        if (status >= 500) {
          Sentry.captureException(err);
        }
        return throwError(() => err);
      }),
    );
  }
}
