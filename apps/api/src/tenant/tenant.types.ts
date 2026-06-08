import type { OrgPermission } from "@prisma/client";

export type StaffContext = {
  staffId: string;
  orgId: string;
  siteId: string | null;
  orgPermission: OrgPermission;
  roleCode: string;
  jurisdiction: string;
};
