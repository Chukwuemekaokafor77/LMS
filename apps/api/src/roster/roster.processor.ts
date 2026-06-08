import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { parse as parseCsv } from "csv-parse/sync";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../storage/s3.service";
import { InvitationsService } from "../staff/invitations.service";
import { QUEUES } from "../queue/queue.module";

type Row = {
  email: string;
  firstName?: string;
  lastName?: string;
  roleCode: string;
  siteName?: string;
  employmentType?: string;
};

const HEADERS_REQUIRED = ["email", "roleCode"];

@Processor(QUEUES.roster)
export class RosterProcessor extends WorkerHost {
  private readonly log = new Logger(RosterProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly invitations: InvitationsService,
  ) {
    super();
  }

  async process(job: Job<{ importId: string }>): Promise<void> {
    const { importId } = job.data;
    const imp = await this.prisma.rosterImport.findUnique({
      where: { id: importId },
      include: { org: true },
    });
    if (!imp) return;

    await this.prisma.rosterImport.update({
      where: { id: importId },
      data: { status: "PROCESSING" },
    });

    const errors: { row: number; email?: string; reason: string }[] = [];
    let processed = 0;

    try {
      const buf = await this.s3.getObjectBytes(imp.fileS3Key);
      const rows = parseCsv(buf, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Row[];

      if (rows.length > 0) {
        for (const h of HEADERS_REQUIRED) {
          if (!(h in rows[0])) {
            throw new Error(`Missing required column: ${h}`);
          }
        }
      }

      const sites = await this.prisma.site.findMany({
        where: { orgId: imp.orgId },
        select: { id: true, name: true },
      });
      const siteByName = new Map(sites.map((s) => [s.name.toLowerCase(), s]));

      const actorStub = {
        staffId: imp.uploadedById,
        orgId: imp.orgId,
        siteId: null,
        orgPermission: "ORG_ADMIN" as const,
        roleCode: "",
        jurisdiction: imp.org.jurisdiction,
      };

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rowNo = i + 2; // +1 for header, +1 for human 1-indexing
        try {
          if (!r.email || !/^.+@.+\..+$/.test(r.email)) {
            throw new Error("invalid email");
          }
          const siteId = r.siteName
            ? siteByName.get(r.siteName.toLowerCase())?.id
            : undefined;
          if (r.siteName && !siteId) {
            throw new Error(`unknown site "${r.siteName}"`);
          }
          await this.invitations.invite(actorStub, {
            email: r.email,
            roleCode: r.roleCode,
            siteId,
            employmentType: r.employmentType,
          });
          processed++;
        } catch (e) {
          errors.push({
            row: rowNo,
            email: r.email,
            reason: (e as Error).message,
          });
        }
      }

      await this.prisma.rosterImport.update({
        where: { id: importId },
        data: {
          status: errors.length > 0 && processed === 0 ? "FAILED" : "DONE",
          rowsProcessed: processed,
          rowsErrored: errors.length,
          errors: errors as object,
        },
      });
    } catch (e) {
      this.log.error(`Roster import ${importId} failed`, e as Error);
      await this.prisma.rosterImport.update({
        where: { id: importId },
        data: {
          status: "FAILED",
          errors: [{ row: 0, reason: (e as Error).message }] as object,
        },
      });
    }
  }
}
