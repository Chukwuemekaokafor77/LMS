import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { CurrentStaff } from "../tenant/current-staff.decorator";
import type { StaffContext } from "../tenant/tenant.types";
import { ReportsService, type ReportFilters } from "./reports.service";
import { PhiAccess } from "../audit/phi-access.decorator";
import { ReportFiltersDto } from "./dto/report-filters.dto";

function parseFilters(q: ReportFiltersDto): ReportFilters {
  return {
    siteId: q.siteId,
    moduleSlug: q.module,
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
  };
}

@Controller("reports/completions")
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get()
  @PhiAccess({ entityType: "Assignment", action: "list", idsFrom: "response" })
  async json(
    @Query() q: ReportFiltersDto,
    @CurrentStaff() actor: StaffContext | undefined,
  ) {
    if (!actor) throw new ForbiddenException();
    return this.svc.fetch(actor, parseFilters(q));
  }

  @Get("csv")
  @PhiAccess({ entityType: "Assignment", action: "export" })
  async csv(
    @Query() q: ReportFiltersDto,
    @CurrentStaff() actor: StaffContext | undefined,
    @Res() res: Response,
  ) {
    if (!actor) throw new ForbiddenException();
    const csv = await this.svc.toCsv(actor, parseFilters(q));
    const stamp = new Date().toISOString().slice(0, 10);
    res
      .header("Content-Type", "text/csv; charset=utf-8")
      .header(
        "Content-Disposition",
        `attachment; filename="maple-care-completions-${stamp}.csv"`,
      )
      .send(csv);
  }

  @Get("pdf")
  @PhiAccess({ entityType: "Assignment", action: "export" })
  async pdf(
    @Query() q: ReportFiltersDto,
    @CurrentStaff() actor: StaffContext | undefined,
    @Res() res: Response,
  ) {
    if (!actor) throw new ForbiddenException();
    const pdf = await this.svc.toPdf(actor, parseFilters(q));
    const stamp = new Date().toISOString().slice(0, 10);
    res
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `attachment; filename="maple-care-completions-${stamp}.pdf"`,
      )
      .send(pdf);
  }
}
