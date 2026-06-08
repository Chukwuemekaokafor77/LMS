import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Mux from "@mux/mux-node";

@Injectable()
export class MuxService implements OnModuleInit {
  private _client!: Mux;
  private _webhookSecret!: string;
  private _signingKeyId?: string;
  private _signingKeyPrivate?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this._client = new Mux({
      tokenId: this.config.getOrThrow<string>("MUX_TOKEN_ID"),
      tokenSecret: this.config.getOrThrow<string>("MUX_TOKEN_SECRET"),
    });
    this._webhookSecret = this.config.getOrThrow<string>("MUX_WEBHOOK_SECRET");
    this._signingKeyId = this.config.get<string>("MUX_SIGNING_KEY_ID");
    this._signingKeyPrivate = this.config.get<string>(
      "MUX_SIGNING_KEY_PRIVATE",
    );
  }

  get client() {
    return this._client;
  }

  verifyWebhook(rawBody: Buffer, signature: string) {
    return Mux.webhooks.verifySignature(
      rawBody.toString("utf8"),
      { "mux-signature": signature },
      this._webhookSecret,
    );
  }

  /**
   * Sign a JWT for a `signed` playback ID. Required when
   * lessons are gated by enrollment. Returns the URL params.
   */
  signPlayback(playbackId: string, ttlSeconds = 3600) {
    if (!this._signingKeyId || !this._signingKeyPrivate) {
      throw new Error("Mux signing key not configured");
    }
    return this._client.jwt.signPlaybackId(playbackId, {
      keyId: this._signingKeyId,
      keySecret: this._signingKeyPrivate,
      type: "video",
      expiration: `${ttlSeconds}s`,
    });
  }
}
