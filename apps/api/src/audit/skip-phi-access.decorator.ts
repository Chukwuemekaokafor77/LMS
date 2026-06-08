import { SetMetadata } from "@nestjs/common";

export const SKIP_PHI_ACCESS_KEY = "skipPhiAccess";

export const SkipPhiAccess = () => SetMetadata(SKIP_PHI_ACCESS_KEY, true);
