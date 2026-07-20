import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

/** Claims returned by ElderCare's POST /academy/exchange (psw routers/academy.py). */
export type EldercareClaims = {
  sub: string;
  email: string;
  name: string | null;
  locale: string | null; // "en" | "fr"
  org: { id: string; name: string; province: string | null };
  facility: { id: string; name: string } | null;
  role: string;
  entitlement: { status: string; tier: string; seats: number };
};

/**
 * Server-to-server client for ElderCare's handoff-exchange endpoint. HMAC
 * service auth mirrors the provider side exactly: signature =
 * HMAC-SHA256(secret, "<unix-ts>.<raw-body>").
 */
@Injectable()
export class AcademyExchangeClient {
  constructor(private readonly config: ConfigService) {}

  async exchange(oneTimeToken: string): Promise<EldercareClaims> {
    const baseUrl = this.config.get<string>("ELDERCARE_API_URL");
    const secret = this.config.get<string>("ACADEMY_EXCHANGE_SECRET");
    if (!baseUrl || !secret) {
      throw new ServiceUnavailableException("ElderCare SSO is not configured");
    }

    const body = JSON.stringify({ token: oneTimeToken });
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", secret)
      .update(`${ts}.${body}`)
      .digest("hex");

    const res = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/academy/exchange`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-academy-timestamp": ts,
          "x-academy-signature": signature,
        },
        body,
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`ElderCare exchange failed (${res.status}): ${detail}`);
    }
    return (await res.json()) as EldercareClaims;
  }
}
