import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

export const ACADEMY_SESSION_TTL_SECONDS = 8 * 60 * 60; // one shift

/**
 * Academy-native sessions — what replaces Clerk's tokens after the cutover.
 * HS256 with an Academy-only secret; `sub` is the user's externalAuthId
 * (their ElderCare user id). No refresh tokens: expiry re-runs the ElderCare
 * handoff, which is invisible while the ElderCare login is alive.
 */
@Injectable()
export class AcademySessionService {
  constructor(private readonly config: ConfigService) {}

  private secret(): string {
    const s = this.config.get<string>("ACADEMY_SESSION_SECRET");
    if (!s) {
      throw new ServiceUnavailableException("Academy sessions not configured");
    }
    return s;
  }

  mint(externalAuthId: string): { token: string; expiresIn: number } {
    const token = jwt.sign(
      { typ: "academy_session" },
      this.secret(),
      {
        algorithm: "HS256",
        subject: externalAuthId,
        issuer: "eldercare-academy",
        expiresIn: ACADEMY_SESSION_TTL_SECONDS,
      },
    );
    return { token, expiresIn: ACADEMY_SESSION_TTL_SECONDS };
  }

  verify(token: string): { externalAuthId: string } {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.secret(), {
        algorithms: ["HS256"],
        issuer: "eldercare-academy",
      }) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid session");
    }
    if (payload.typ !== "academy_session" || !payload.sub) {
      throw new UnauthorizedException("Invalid session");
    }
    return { externalAuthId: payload.sub };
  }
}
