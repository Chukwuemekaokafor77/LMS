import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

/** Mirrors ElderCare's CertificateFlowback pydantic model (psw academy.py). */
export type CertificateFlowbackPayload = {
  external_user_id: string;
  certificate_id: string;
  module_title: string;
  issued_at: string;
  expires_at: string | null;
  sha256: string | null;
  attachment_url?: string | null;
};

/**
 * Delivers issued certificates to ElderCare's inbound webhook (Seam 3). Same
 * HMAC service auth as the SSO exchange (Academy signs, ElderCare verifies):
 * signature = HMAC-SHA256(ACADEMY_EXCHANGE_SECRET, "<unix-ts>.<raw-body>").
 */
@Injectable()
export class EldercareFlowbackClient {
  constructor(private readonly config: ConfigService) {}

  /** False in envs without ElderCare wired (e.g. local dev) — caller skips. */
  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>("ELDERCARE_API_URL") &&
        this.config.get<string>("ACADEMY_EXCHANGE_SECRET"),
    );
  }

  async sendCertificate(payload: CertificateFlowbackPayload): Promise<void> {
    const baseUrl = this.config.get<string>("ELDERCARE_API_URL");
    const secret = this.config.get<string>("ACADEMY_EXCHANGE_SECRET");
    if (!baseUrl || !secret) {
      throw new Error("ElderCare flow-back is not configured");
    }

    const body = JSON.stringify(payload);
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", secret)
      .update(`${ts}.${body}`)
      .digest("hex");

    const res = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/v1/academy/certificate`,
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
      throw new Error(`ElderCare flow-back failed (${res.status}): ${detail}`);
    }
  }
}
