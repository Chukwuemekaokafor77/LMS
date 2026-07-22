import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Logger,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Get,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { PrismaService } from "../prisma/prisma.service";
import { MuxService } from "./mux.service";
import { VideoService } from "./video.service";
import { SkipPhiAccess } from "../audit/skip-phi-access.decorator";

@Controller()
export class VideoController {
  private readonly log = new Logger(VideoController.name);

  constructor(
    private readonly video: VideoService,
    private readonly mux: MuxService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("lessons/:id/upload")
  @SkipPhiAccess()
  async createUpload(
    @Param("id") id: string,
    @CurrentUser() user: { id: string } | undefined,
  ) {
    if (!user) throw new UnauthorizedException();
    return this.video.createUploadForLesson(id, user.id);
  }

  @Get("lessons/:id/playback")
  @SkipPhiAccess()
  async playback(
    @Param("id") id: string,
    @CurrentStaff() staff: StaffContext | undefined,
  ) {
    if (!staff) throw new ForbiddenException("No org context");
    return this.video.getSignedPlayback(id, staff.staffId);
  }

  @Public()
  @Post("webhooks/mux")
  @SkipPhiAccess()
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async webhook(
    @Req() req: Request,
    @Headers("mux-signature") signature: string | undefined,
  ) {
    if (!signature) throw new BadRequestException("Missing mux-signature");
    const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!raw) throw new BadRequestException("Missing raw body");

    try {
      this.mux.verifyWebhook(raw, signature);
    } catch (err) {
      this.log.warn(`Mux signature failed: ${(err as Error).message}`);
      throw new BadRequestException("Invalid signature");
    }

    const event = JSON.parse(raw.toString("utf8")) as {
      type: string;
      data: {
        id?: string;
        passthrough?: string;
        upload_id?: string;
        playback_ids?: { id: string; policy: string }[];
        duration?: number;
      };
    };

    switch (event.type) {
      case "video.asset.ready": {
        const lessonId = event.data.passthrough;
        if (!lessonId) break;
        const playback = event.data.playback_ids?.[0];
        await this.prisma.lesson.update({
          where: { id: lessonId },
          data: {
            videoStatus: "READY",
            muxAssetId: event.data.id,
            muxPlaybackId: playback?.id,
            durationSec: event.data.duration
              ? Math.round(event.data.duration)
              : undefined,
          },
        });
        break;
      }
      case "video.asset.errored": {
        const lessonId = event.data.passthrough;
        if (!lessonId) break;
        await this.prisma.lesson.update({
          where: { id: lessonId },
          data: { videoStatus: "ERRORED" },
        });
        break;
      }
      case "video.upload.asset_created": {
        if (!event.data.upload_id) break;
        await this.prisma.lesson.updateMany({
          where: { muxUploadId: event.data.upload_id },
          data: { videoStatus: "PROCESSING" },
        });
        break;
      }
      default:
        this.log.debug(`Unhandled mux event ${event.type}`);
    }
    return { ok: true };
  }
}
