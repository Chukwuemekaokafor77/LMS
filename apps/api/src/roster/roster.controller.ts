import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { S3Service } from "../storage/s3.service";
import { PrismaService } from "../prisma/prisma.service";
import { QUEUES } from "../queue/queue.module";
import { PhiAccess } from "../audit/phi-access.decorator";
import { StartRosterImportDto, CommitRosterImportDto } from "./dto/roster-import.dto";



@Controller("roster-imports")
export class RosterController {
  constructor(
    private readonly s3: S3Service,
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES.roster) private readonly queue: Queue,
  ) {}

  /** Step 1 — admin asks for a presigned PUT URL and creates a stub import. */
  @Post("start")
  @PhiAccess({ entityType: "RosterImport", action: "export" }) // Creating an import is like an export of data to be handled
  async start(
    @Body() body: StartRosterImportDto,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor || actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    const { filename } = body;
    const importRow = await this.prisma.rosterImport.create({
      data: {
        orgId: actor.orgId,
        uploadedById: actor.staffId,
        fileS3Key: `roster-imports/${actor.orgId}/pending`,
        status: "QUEUED",
      },
    });
    const key = `roster-imports/${actor.orgId}/${importRow.id}-${filename}`;
    await this.prisma.rosterImport.update({
      where: { id: importRow.id },
      data: { fileS3Key: key },
    });
    const uploadUrl = await this.s3.presignPut(key, "text/csv");
    return { importId: importRow.id, uploadUrl, key };
  }

  /** Step 2 — admin reports the upload finished. We enqueue processing. */
  @Post("commit")
  @PhiAccess({ entityType: "RosterImport", action: "export" })
  async commit(
    @Body() body: CommitRosterImportDto,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor || actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    const { importId } = body;
    const row = await this.prisma.rosterImport.findUnique({
      where: { id: importId },
    });
    if (!row || row.orgId !== actor.orgId) {
      throw new ForbiddenException("Not your import");
    }
    await this.queue.add("process", { importId });
    return { ok: true };
  }

  @Get(":id")
  @PhiAccess({ entityType: "RosterImport", action: "read" })
  async status(
    @Param("id") id: string,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor || actor.orgPermission !== "ORG_ADMIN") {
      throw new ForbiddenException("Org admin required");
    }
    const row = await this.prisma.rosterImport.findUnique({ where: { id } });
    if (!row || row.orgId !== actor.orgId) {
      throw new ForbiddenException();
    }
    return row;
  }
}
