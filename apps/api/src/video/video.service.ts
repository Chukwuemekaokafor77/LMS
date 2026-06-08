import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MuxService } from "./mux.service";

@Injectable()
export class VideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mux: MuxService,
  ) {}

  async createUploadForLesson(lessonId: string, orgAdminUserId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException("Lesson not found");

    // Only an ORG_ADMIN of the module's owning org may upload.
    // Global library modules (orgId null) are uploaded by Maple Care staff
    // via a separate internal tool — not exposed here.
    if (lesson.module.orgId === null) {
      throw new ForbiddenException("Library module — not org-uploadable");
    }
    const adminStaff = await this.prisma.staff.findUnique({
      where: { userId: orgAdminUserId },
    });
    if (
      !adminStaff ||
      adminStaff.orgId !== lesson.module.orgId ||
      adminStaff.orgPermission !== "ORG_ADMIN"
    ) {
      throw new ForbiddenException("Org admin required");
    }

    const upload = await this.mux.client.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["signed"],
        passthrough: lesson.id,
      },
    });

    await this.prisma.lesson.update({
      where: { id: lesson.id },
      data: { muxUploadId: upload.id, videoStatus: "UPLOADING" },
    });

    return { uploadUrl: upload.url, uploadId: upload.id };
  }

  /**
   * Returns a signed playback URL for a lesson, gated by:
   *   - the lesson is marked preview, OR
   *   - the user has an active (non-completed-and-expired) Assignment
   *     to the lesson's module.
   */
  async getSignedPlayback(lessonId: string, staffId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson || !lesson.muxPlaybackId || lesson.videoStatus !== "READY") {
      throw new NotFoundException("Video not ready");
    }

    if (!lesson.isPreview) {
      const assignment = await this.prisma.assignment.findFirst({
        where: {
          staffId,
          moduleId: lesson.moduleId,
          status: { in: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"] },
        },
      });
      if (!assignment) throw new ForbiddenException("Not assigned");
    }

    const token = this.mux.signPlayback(lesson.muxPlaybackId);
    return {
      playbackId: lesson.muxPlaybackId,
      token,
      url: `https://stream.mux.com/${lesson.muxPlaybackId}.m3u8?token=${token}`,
    };
  }
}
