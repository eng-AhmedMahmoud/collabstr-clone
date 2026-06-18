import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Get("threads")
  threads(@CurrentUser() user: AuthUser) {
    return this.messages.listThreads(user.id);
  }

  @Get("threads/:id/messages")
  list(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messages.messages(user.id, id);
  }

  @Post("threads/:id/messages")
  send(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("body") body: string) {
    return this.messages.send(user.id, id, body);
  }

  @Post("threads/open/:username")
  open(@CurrentUser() user: AuthUser, @Param("username") username: string) {
    return this.messages.openThread(user.id, username);
  }

  @Post("threads/:id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messages.markRead(user.id, id);
  }
}
