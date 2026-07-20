import { describe, it, expect } from "vitest";
import { mapEldercareRole, mapProvince } from "./eldercare-role-map";

describe("mapProvince", () => {
  it("normalizes codes and names, case-insensitively", () => {
    expect(mapProvince("NB")).toBe("NB");
    expect(mapProvince("new brunswick")).toBe("NB");
    expect(mapProvince("Nova Scotia")).toBe("NS");
    expect(mapProvince("PEI")).toBe("PE");
    expect(mapProvince(" ontario ")).toBe("ON");
  });
  it("returns null for unsupported / empty", () => {
    expect(mapProvince("QC")).toBeNull();
    expect(mapProvince(null)).toBeNull();
    expect(mapProvince("")).toBeNull();
  });
});

describe("mapEldercareRole", () => {
  it("maps the home-support kind per jurisdiction, CCA in NS", () => {
    expect(mapEldercareRole("psw", "NB")?.code).toBe("NB_HSW");
    expect(mapEldercareRole("psw", "PE")?.code).toBe("PE_HSW");
    const ns = mapEldercareRole("psw", "NS");
    expect(ns?.code).toBe("NS_CCA");
    expect(ns?.labelEn).toBe("Continuing Care Assistant");
    expect(ns?.orgPermission).toBe("STAFF");
  });

  it("derives orgPermission from the role kind", () => {
    expect(mapEldercareRole("director_of_care", "NB")?.orgPermission).toBe("ORG_ADMIN");
    expect(mapEldercareRole("ceo", "NB")?.orgPermission).toBe("ORG_ADMIN");
    expect(mapEldercareRole("care_coordinator", "NB")?.orgPermission).toBe("SITE_ADMIN");
    expect(mapEldercareRole("scheduler", "NB")?.orgPermission).toBe("STAFF");
    expect(mapEldercareRole("nurse", "NB")?.code).toBe("NB_RN");
  });

  it("returns null for family and unknown roles (no training seat)", () => {
    expect(mapEldercareRole("family", "NB")).toBeNull();
    expect(mapEldercareRole("astronaut", "NB")).toBeNull();
    expect(mapEldercareRole("", "NB")).toBeNull();
  });

  it("is case-insensitive on the ElderCare role string", () => {
    expect(mapEldercareRole("PSW", "NB")?.code).toBe("NB_HSW");
  });
});
