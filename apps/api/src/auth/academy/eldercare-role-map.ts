import type { Jurisdiction, OrgPermission } from "@prisma/client";

/**
 * Seam 2a — ElderCare job roles → jurisdiction-namespaced LMS Role codes.
 *
 * ElderCare's vocabulary (psw `security/roles.py` ALL_ROLES) collapses into
 * six training-relevant kinds; each kind expands per jurisdiction. "family"
 * has no training seat and is rejected at SSO. Unknown/unmapped roles are an
 * explicit error — never a silent default, because Role.code drives which
 * RequiredTraining policy applies.
 *
 * Nova Scotia's home-support stream is the credentialed CCA path, so the
 * psw-kind maps to NS_CCA there (B0 finding: prep/CE only — the LMS never
 * claims to grant CCA certification).
 *
 * orgPermission mapping is role-kind-derived for v1 (management → ORG_ADMIN,
 * supervisory → SITE_ADMIN, everyone else STAFF). Follow-up recorded in the
 * Academy plan: carry ElderCare's `privilege` in the exchange claims and use
 * it instead.
 */

type RoleKind = "HSW" | "RN" | "AH" | "SUP" | "MGMT" | "OFFICE";

const ELDERCARE_ROLE_KIND: Record<string, RoleKind> = {
  psw: "HSW",
  nurse: "RN",
  physiotherapist: "AH",
  occupational_therapist: "AH",
  field_supervisor: "SUP",
  care_coordinator: "SUP",
  clinical_coordinator: "SUP",
  care_manager: "MGMT",
  director_of_care: "MGMT",
  branch_manager: "MGMT",
  director_of_operations: "MGMT",
  vp_patient_services: "MGMT",
  ceo: "MGMT",
  scheduler: "OFFICE",
  billing_specialist: "OFFICE",
  human_resources: "OFFICE",
  // "family" intentionally absent — no training seat.
};

const KIND_LABELS: Record<RoleKind, { en: string; fr: string }> = {
  HSW: { en: "Home Support Worker", fr: "Préposé(e) au soutien à domicile" },
  RN: { en: "Nurse", fr: "Infirmier(ère)" },
  AH: { en: "Allied Health", fr: "Professionnel(le) paramédical(e)" },
  SUP: { en: "Supervisor / Coordinator", fr: "Superviseur(e) / Coordonnateur(trice)" },
  MGMT: { en: "Management", fr: "Direction" },
  OFFICE: { en: "Office / Administration", fr: "Bureau / Administration" },
};

/** NS home support runs on the CCA certification path (B0). */
const NS_CCA_OVERRIDE: Partial<Record<RoleKind, string>> = { HSW: "CCA" };

const KIND_PERMISSION: Record<RoleKind, OrgPermission> = {
  HSW: "STAFF",
  RN: "STAFF",
  AH: "STAFF",
  SUP: "SITE_ADMIN",
  MGMT: "ORG_ADMIN",
  OFFICE: "STAFF",
};

const PROVINCE_TO_JURISDICTION: Record<string, Jurisdiction> = {
  NB: "NB",
  "NEW BRUNSWICK": "NB",
  "NOUVEAU-BRUNSWICK": "NB",
  NS: "NS",
  "NOVA SCOTIA": "NS",
  PE: "PE",
  PEI: "PE",
  "PRINCE EDWARD ISLAND": "PE",
  NL: "NL",
  "NEWFOUNDLAND AND LABRADOR": "NL",
  ON: "ON",
  ONTARIO: "ON",
};

export function mapProvince(province: string | null | undefined): Jurisdiction | null {
  if (!province) return null;
  return PROVINCE_TO_JURISDICTION[province.trim().toUpperCase()] ?? null;
}

export type MappedRole = {
  code: string;
  labelEn: string;
  labelFr: string;
  orgPermission: OrgPermission;
};

/** Returns null for roles with no training seat (family, unknown). */
export function mapEldercareRole(
  eldercareRole: string,
  jurisdiction: Jurisdiction,
): MappedRole | null {
  const kind = ELDERCARE_ROLE_KIND[eldercareRole?.trim().toLowerCase()];
  if (!kind) return null;
  const suffix =
    (jurisdiction === "NS" ? NS_CCA_OVERRIDE[kind] : undefined) ?? kind;
  const labels = KIND_LABELS[kind];
  return {
    code: `${jurisdiction}_${suffix}`,
    labelEn:
      jurisdiction === "NS" && kind === "HSW"
        ? "Continuing Care Assistant"
        : labels.en,
    labelFr:
      jurisdiction === "NS" && kind === "HSW"
        ? "Assistant(e) en soins continus"
        : labels.fr,
    orgPermission: KIND_PERMISSION[kind],
  };
}
