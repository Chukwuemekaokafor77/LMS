import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service implements OnModuleInit {
  private _client!: S3Client;
  private _bucket!: string;
  private _region!: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this._region = this.config.getOrThrow<string>("AWS_REGION");
    this._bucket = this.config.getOrThrow<string>("AWS_S3_BUCKET");
    this._client = new S3Client({
      region: this._region,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.config.getOrThrow<string>("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }

  get client() {
    return this._client;
  }
  get bucket() {
    return this._bucket;
  }

  async presignPut(key: string, contentType: string, ttlSeconds = 900) {
    return getSignedUrl(
      this._client,
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: ttlSeconds },
    );
  }

  async presignGet(key: string, ttlSeconds = 900) {
    return getSignedUrl(
      this._client,
      new GetObjectCommand({ Bucket: this._bucket, Key: key }),
      { expiresIn: ttlSeconds },
    );
  }

  async getObjectBytes(key: string): Promise<Buffer> {
    const out = await this._client.send(
      new GetObjectCommand({ Bucket: this._bucket, Key: key }),
    );
    const body = out.Body as unknown as { transformToByteArray: () => Promise<Uint8Array> };
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async putObject(key: string, body: Buffer, contentType: string) {
    await this._client.send(
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }
}
