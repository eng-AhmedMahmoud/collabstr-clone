import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { MessagesGateway } from "./messages.gateway";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SendMessageInput } from "@collabstr/shared-types";

@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  // Gateway injected into the controller (not the service) so HTTP sends can
  // broadcast without creating a gateway<->service circular dependency.
  constructor(private messages: MessagesService, private gateway: MessagesGateway) {}

  @Get("threads")
  threads(@CurrentUser() user: AuthUser) {
    return this.messages.listThreads(user.id);
  }

  @Get("threads/:id/messages")
  list(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.messages.messages(user.id, id);
  }

  @Post("threads/:id/messages")
  async send(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(SendMessageInput)) input: SendMessageInput,
  ) {
    const message = await this.messages.send(user.id, id, input.body);
    // Mirror the message onto any connected sockets so HTTP and WS clients
    // stay in sync.
    const participants = await this.messages.threadParticipants(id);
    this.gateway.broadcastMessage(id, message, participants);
    return message;
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
