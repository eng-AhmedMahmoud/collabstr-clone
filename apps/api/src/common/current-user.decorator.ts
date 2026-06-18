import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AuthUser = { id: string; email: string; role: "brand" | "creator" | "admin" };

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
