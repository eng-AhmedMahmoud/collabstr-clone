import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@prisma/client";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required || required.length === 0) return true;
    const { user } = ctx.switchToHttp().getRequest();
    // Role hierarchy: superadmin implicitly satisfies any route that requires
    // "admin" (it can do everything admin can). Every other role must match
    // exactly.
    const role: Role | undefined = user?.role;
    const satisfies =
      !!role && (required.includes(role) || (role === "superadmin" && required.includes("admin")));
    if (!satisfies) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}
