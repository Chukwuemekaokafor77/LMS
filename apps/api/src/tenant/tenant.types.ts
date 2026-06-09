import type { OrgPermission } from "@prisma/client";

export type StaffContext = {
  staffId: string;
  userId: string; // the actor's User id — used for AuditEvent.actorId (LMS-M4)
  orgId: string;
  siteId: string | null;
  orgPermission: OrgPermission;
  roleCode: string;
  jurisdiction: string;
};
