import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { MessagesGateway } from "./messages.gateway";

@Module({
  // Same JwtModule.register({}) pattern as AuthModule: the secret is passed
  // explicitly at verify time (JWT_ACCESS_SECRET), not baked into registration.
  imports: [JwtModule.register({})],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
