import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { StaffContext } from "./tenant.types";

export const CurrentStaff = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): StaffContext | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.staff as StaffContext | undefined;
  },
);
