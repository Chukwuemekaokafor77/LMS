import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

/**
 * Resend-backed sender. In development, if RESEND_API_KEY is unset
 * we log instead of sending — keeps `pnpm dev` working without secrets.
 */
@Injectable()
export class EmailSender implements OnModuleInit {
  private readonly log = new Logger(EmailSender.name);
  private apiKey?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.apiKey = this.config.get<string>("RESEND_API_KEY");
  }

  async send(msg: EmailMessage) {
    if (!this.apiKey) {
      this.log.warn(`[email-mock] to=${msg.to} subject=${msg.subject}`);
      return { id: "mock" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(msg),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend ${res.status}: ${body}`);
    }
    return (await res.json()) as { id: string };
  }
}
