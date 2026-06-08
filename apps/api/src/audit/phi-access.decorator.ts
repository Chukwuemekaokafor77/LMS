import { SetMetadata } from "@nestjs/common";

export const PHI_ACCESS_KEY = "phiAccess";

export type PhiAccessConfig = {
  entityType: string;
  action: "read" | "list" | "export" | "download";
  /**
   * Function (relative to controller) that, given the response and request,
   * returns the entity id(s) that were accessed. Defaults to req.params.id.
   */
  idsFrom?: "param" | "response" | ((res: unknown) => string[]);
};

export const PhiAccess = (cfg: PhiAccessConfig) =>
  SetMetadata(PHI_ACCESS_KEY, cfg);
