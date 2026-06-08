import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { EmailSender } from "./email.sender";
import { QUEUES } from "../queue/queue.module";

type Jobs = {
  "assignment.assigned": { assignmentId: string };
  "assignment.due-soon": { assignmentId: string };
  "certificate.issued": { certificateId: string };
};

@Processor(QUEUES.email)
export class EmailProcessor extends WorkerHost {
  private readonly log = new Logger(EmailProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: EmailSender,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<Jobs[keyof Jobs]>): Promise<void> {
    const from = this.config.getOrThrow<string>("EMAIL_FROM");

    if (job.name === "assignment.assigned") {
      const { assignmentId } = job.data as Jobs["assignment.assigned"];
      const a = await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          staff: { include: { user: true } },
          module: true,
        },
      });
      if (!a) return;
      const locale = a.staff.user.preferredLocale;
      await this.sender.send({
        from,
        to: a.staff.user.email,
        subject:
          locale === "fr-CA"
            ? `Nouvelle formation à compléter : ${a.module.titleFr}`
            : `New training assigned: ${a.module.titleEn}`,
        html: assignmentEmailHtml(a, locale),
      });
      return;
    }

    if (job.name === "assignment.due-soon") {
      const { assignmentId } = job.data as Jobs["assignment.due-soon"];
      const a = await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          staff: { include: { user: true } },
          module: true,
        },
      });
      if (!a || a.status === "COMPLETED") return;
      const locale = a.staff.user.preferredLocale;
      await this.sender.send({
        from,
        to: a.staff.user.email,
        subject:
          locale === "fr-CA"
            ? `Rappel : ${a.module.titleFr} bientôt due`
            : `Reminder: ${a.module.titleEn} due soon`,
        html: assignmentEmailHtml(a, locale, /* reminder */ true),
      });
      return;
    }

    if (job.name === "certificate.issued") {
      const { certificateId } = job.data as Jobs["certificate.issued"];
      const c = await this.prisma.certificate.findUnique({
        where: { id: certificateId },
        include: {
          assignment: {
            include: {
              staff: { include: { user: true } },
              module: true,
            },
          },
        },
      });
      if (!c) return;
      const locale = c.assignment.staff.user.preferredLocale;
      await this.sender.send({
        from,
        to: c.assignment.staff.user.email,
        subject:
          locale === "fr-CA"
            ? `Attestation de réussite : ${c.assignment.module.titleFr}`
            : `Certificate of completion: ${c.assignment.module.titleEn}`,
        html: certificateEmailHtml(c, locale),
      });
      return;
    }

    this.log.warn(`Unknown email job ${job.name}`);
  }
}

function assignmentEmailHtml(
  a: {
    dueAt: Date;
    module: { titleEn: string; titleFr: string; slug: string };
    staff: { user: { name: string | null } };
  },
  locale: string,
  reminder = false,
): string {
  const base = process.env.WEB_BASE_URL ?? "http://localhost:3000";
  const link = `${base}/training/${a.module.slug}`;
  const due = a.dueAt.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (locale === "fr-CA") {
    return `
      <h1>${reminder ? "Rappel" : "Bonjour"}${
        a.staff.user.name ? `, ${esc(a.staff.user.name)}` : ""
      }</h1>
      <p>Vous devez compléter <strong>${esc(a.module.titleFr)}</strong> avant le ${due}.</p>
      <p><a href="${link}">Commencer la formation</a></p>
    `;
  }
  return `
    <h1>${reminder ? "Reminder" : "Hello"}${
      a.staff.user.name ? `, ${esc(a.staff.user.name)}` : ""
    }</h1>
    <p>You're required to complete <strong>${esc(a.module.titleEn)}</strong> by ${due}.</p>
    <p><a href="${link}">Start training</a></p>
  `;
}

function certificateEmailHtml(
  c: {
    issuedAt: Date;
    assignment: {
      module: { titleEn: string; titleFr: string };
      staff: { user: { name: string | null } };
    };
  },
  locale: string,
): string {
  const issued = c.issuedAt.toLocaleDateString(locale);
  if (locale === "fr-CA") {
    return `
      <h1>Félicitations${
        c.assignment.staff.user.name
          ? `, ${esc(c.assignment.staff.user.name)}`
          : ""
      }</h1>
      <p>Vous avez complété <strong>${esc(c.assignment.module.titleFr)}</strong> le ${issued}.</p>
      <p>Votre attestation est disponible dans votre tableau de bord.</p>
    `;
  }
  return `
    <h1>Congratulations${
      c.assignment.staff.user.name
        ? `, ${esc(c.assignment.staff.user.name)}`
        : ""
    }</h1>
    <p>You completed <strong>${esc(c.assignment.module.titleEn)}</strong> on ${issued}.</p>
    <p>Your certificate is available in your dashboard.</p>
  `;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
