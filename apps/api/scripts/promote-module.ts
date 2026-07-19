/**
 * Promote an org-authored module to the shared global library (orgId -> null),
 * or demote it back to an org for further editing.
 *
 * The library-authoring workflow (completion plan, Phase B): Maple Care
 * authors content in its own "HQ" org through the normal admin authoring UI,
 * then promotes the finished module so every agency's catalog picks it up.
 * To edit a library module later: demote it back to the HQ org, edit in the
 * UI, promote again. The module id (and slug) never change, so existing
 * assignments keep working.
 *
 * Usage (reads DATABASE_URL from .env):
 *   pnpm --filter @maple-care/api run library:promote -- <slug-or-id>
 *   pnpm --filter @maple-care/api run library:promote -- <slug-or-id> --jurisdiction NB
 *   pnpm --filter @maple-care/api run library:promote -- <slug-or-id> --demote-to <orgId>
 *
 * Promoting without --jurisdiction leaves the module visible in every
 * province; with it, only orgs of that jurisdiction see it.
 */
import { PrismaClient, Jurisdiction } from "@prisma/client";

export type PromoteOptions =
  | { demoteToOrgId: string }
  | { jurisdiction: Jurisdiction | null };

export async function promoteModule(
  db: PrismaClient,
  slugOrId: string,
  opts: PromoteOptions,
) {
  const mod = await db.module.findFirst({
    where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
  });
  if (!mod) throw new Error(`Module not found: ${slugOrId}`);

  if ("demoteToOrgId" in opts) {
    if (mod.orgId !== null) {
      throw new Error(
        `Module ${mod.slug} is org-owned (${mod.orgId}) — nothing to demote`,
      );
    }
    const org = await db.organization.findUnique({
      where: { id: opts.demoteToOrgId },
    });
    if (!org) throw new Error(`Org not found: ${opts.demoteToOrgId}`);
    const updated = await db.module.update({
      where: { id: mod.id },
      // Org modules ignore jurisdiction on the learner read path; clear it so
      // re-promotion states the intent explicitly each time.
      data: { orgId: org.id, jurisdiction: null },
    });
    await db.auditEvent.create({
      data: {
        action: "module.demoted_from_library",
        entityType: "Module",
        entityId: mod.id,
        orgId: org.id,
        payload: { slug: mod.slug },
      },
    });
    return updated;
  }

  if (mod.orgId === null) {
    throw new Error(`Module ${mod.slug} is already in the global library`);
  }
  const updated = await db.module.update({
    where: { id: mod.id },
    data: { orgId: null, jurisdiction: opts.jurisdiction },
  });
  await db.auditEvent.create({
    data: {
      action: "module.promoted_to_library",
      entityType: "Module",
      entityId: mod.id,
      orgId: mod.orgId,
      payload: { slug: mod.slug, jurisdiction: opts.jurisdiction },
    },
  });
  return updated;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const target = args[0];
  if (!target) {
    console.error(
      "Usage: promote-module <slug-or-id> [--jurisdiction NB|NS|PE|NL|ON] [--demote-to <orgId>]",
    );
    process.exit(1);
  }

  const demoteIdx = args.indexOf("--demote-to");
  const jurIdx = args.indexOf("--jurisdiction");
  let opts: PromoteOptions;
  if (demoteIdx !== -1) {
    const orgId = args[demoteIdx + 1];
    if (!orgId) throw new Error("--demote-to needs an orgId");
    opts = { demoteToOrgId: orgId };
  } else {
    let jurisdiction: Jurisdiction | null = null;
    if (jurIdx !== -1) {
      const j = args[jurIdx + 1];
      if (!j || !(j in Jurisdiction)) {
        throw new Error(`--jurisdiction must be one of ${Object.keys(Jurisdiction).join("|")}`);
      }
      jurisdiction = j as Jurisdiction;
    }
    opts = { jurisdiction };
  }

  const db = new PrismaClient();
  try {
    const mod = await promoteModule(db, target, opts);
    console.log(
      `${mod.slug}: orgId=${mod.orgId ?? "null (library)"} jurisdiction=${mod.jurisdiction ?? "all"} status=${mod.status}`,
    );
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error((e as Error).message);
    process.exit(1);
  });
}
