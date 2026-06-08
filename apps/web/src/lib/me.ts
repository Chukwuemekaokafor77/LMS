import { apiFetch } from "./api";

export type Me = {
  user: {
    id: string;
    email: string;
    name: string | null;
    preferredLocale: string;
  };
  staff: {
    staffId: string;
    orgId: string;
    siteId: string | null;
    orgPermission: "STAFF" | "SITE_ADMIN" | "ORG_ADMIN";
    roleCode: string;
    jurisdiction: string;
  } | null;
};

export async function getMe(): Promise<Me | null> {
  const res = await apiFetch("/me");
  if (!res.ok) return null;
  return res.json();
}
