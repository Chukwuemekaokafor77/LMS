import {
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import PDFDocument from "pdfkit";
import { PrismaService } from "../prisma/prisma.service";
import type { StaffContext } from "../tenant/tenant.types";

export type ReportFilters = {
  siteId?: string;
  moduleSlug?: string;
  from?: Date;
  to?: Date;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(actor: StaffContext, f: ReportFilters) {
    const targetSiteId =
      actor.orgPermission === "SITE_ADMIN" && actor.siteId
        ? actor.siteId
        : f.siteId;
    return {
      staff: {
        orgId: actor.orgId,
        ...(targetSiteId ? { siteId: targetSiteId } : {}),
      },
      ...(f.moduleSlug ? { module: { slug: f.moduleSlug } } : {}),
      ...(f.from || f.to
        ? {
            completedAt: {
              ...(f.from ? { gte: f.from } : {}),
              ...(f.to ? { lte: f.to } : {}),
            },
          }
        : {}),
      status: "COMPLETED" as const,
    };
  }

  private requireAdmin(actor: StaffContext) {
    if (actor.orgPermission === "STAFF") {
      throw new ForbiddenException("Admin required");
    }
  }

  async fetch(actor: StaffContext, f: ReportFilters) {
    this.requireAdmin(actor);
    const rows = await this.prisma.assignment.findMany({
      where: this.buildWhere(actor, f),
      include: {
        staff: {
          include: {
            user: { select: { name: true, email: true } },
            role: { select: { code: true, labelEn: true } },
            site: { select: { name: true } },
          },
        },
        module: { select: { slug: true, titleEn: true, titleFr: true } },
        certificate: true,
        attempts: {
          where: { passed: true },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { completedAt: "desc" },
    });
    return rows;
  }

  async toCsv(actor: StaffContext, f: ReportFilters): Promise<string> {
    const rows = await this.fetch(actor, f);
    const headers = [
      "completed_at",
      "site",
      "staff_name",
      "staff_email",
      "role",
      "module_slug",
      "module_title_en",
      "score_pct",
      "attestation_hash",
      "certificate_sha256",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      const a = r.attempts[0];
      lines.push(
        [
          r.completedAt?.toISOString() ?? "",
          r.staff.site?.name ?? "",
          r.staff.user.name ?? "",
          r.staff.user.email,
          r.staff.role.code,
          r.module.slug,
          r.module.titleEn,
          a?.scorePct ?? "",
          a?.attestationHash ?? "",
          r.certificate?.sha256 ?? "",
        ]
          .map(escape)
          .join(","),
      );
    }
    return lines.join("\n");
  }

  async toPdf(actor: StaffContext, f: ReportFilters): Promise<Buffer> {
    const rows = await this.fetch(actor, f);
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: "LETTER", margin: 40, layout: "landscape" });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(16).text("ElderCare Academy — Compliance Training Report");
      doc
        .fontSize(9)
        .fillColor("#666")
        .text(
          `Generated ${new Date().toISOString()} · ${rows.length} completion(s)` +
            (f.from ? ` · from ${f.from.toISOString().slice(0, 10)}` : "") +
            (f.to ? ` · to ${f.to.toISOString().slice(0, 10)}` : "") +
            (f.moduleSlug ? ` · module ${f.moduleSlug}` : "") +
            (f.siteId ? ` · site filter applied` : ""),
        );
      doc.moveDown();

      doc.fillColor("#000").fontSize(8);
      const cols = [
        { h: "Completed", w: 70 },
        { h: "Site", w: 90 },
        { h: "Staff", w: 110 },
        { h: "Role", w: 60 },
        { h: "Module", w: 160 },
        { h: "Score", w: 35 },
        { h: "Attestation hash", w: 200 },
      ];
      let x = doc.x;
      const startY = doc.y;
      cols.forEach((c) => {
        doc.text(c.h, x, startY, { width: c.w });
        x += c.w;
      });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(770, doc.y).stroke();

      for (const r of rows) {
        const a = r.attempts[0];
        x = 40;
        const y = doc.y + 4;
        const cells = [
          r.completedAt?.toISOString().slice(0, 10) ?? "",
          r.staff.site?.name ?? "",
          r.staff.user.name ?? r.staff.user.email,
          r.staff.role.code,
          r.module.titleEn,
          a?.scorePct != null ? `${a.scorePct}%` : "",
          a?.attestationHash?.slice(0, 32) ?? "",
        ];
        cells.forEach((v, i) => {
          doc.text(v, x, y, { width: cols[i].w });
          x += cols[i].w;
        });
        doc.moveDown(0.6);
        if (doc.y > 540) doc.addPage();
      }

      doc.end();
    });
  }
}
