import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Like JwtAuthGuard but never rejects: anonymous requests pass through with
// req.user unset, so public endpoints can tailor responses for viewers who
// happen to be logged in (e.g. campaign owners seeing applicants).
@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  handleRequest<TUser = any>(_err: unknown, user: TUser | false): TUser | undefined {
    return user || undefined;
  }
}
