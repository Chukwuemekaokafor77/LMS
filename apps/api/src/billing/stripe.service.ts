import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService implements OnModuleInit {
  private _client!: Stripe;
  private _webhookSecret!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this._client = new Stripe(
      this.config.getOrThrow<string>("STRIPE_SECRET_KEY"),
      // Pinned to the API version the installed `stripe` SDK is typed for.
      { apiVersion: "2025-02-24.acacia" },
    );
    this._webhookSecret = this.config.getOrThrow<string>(
      "STRIPE_WEBHOOK_SECRET",
    );
  }

  get client() {
    return this._client;
  }

  constructEvent(rawBody: Buffer, signature: string) {
    return this._client.webhooks.constructEvent(
      rawBody,
      signature,
      this._webhookSecret,
    );
  }
}
