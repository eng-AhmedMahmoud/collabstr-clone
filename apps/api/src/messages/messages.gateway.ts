import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { PrismaService } from "../prisma/prisma.service";
import { MessagesService } from "./messages.service";

// Mirror the HTTP CORS allowlist so browser clients on the same origins can
// open a socket. Node/mobile clients send no Origin and are unaffected.
const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: { origin: corsOrigins, credentials: true },
})
export class MessagesGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly messages: MessagesService,
    private readonly prisma: PrismaService,
  ) {}

  // Authenticate on connect. Web sends the httpOnly access_token cookie;
  // mobile sends the raw/Bearer token via socket.handshake.auth.token.
  async handleConnection(socket: Socket) {
    try {
      const token = this.extractToken(socket);
      if (!token) return socket.disconnect();
      const payload = await this.jwt.verifyAsync<{ sub?: string }>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      if (!payload?.sub) return socket.disconnect();
      socket.data.userId = payload.sub;
      socket.join(`user:${payload.sub}`);
    } catch {
      socket.disconnect();
    }
  }

  private extractToken(socket: Socket): string | null {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim()) {
      return authToken.replace(/^Bearer\s+/i, "").trim();
    }
    const cookie = socket.handshake.headers.cookie;
    if (cookie) {
      for (const part of cookie.split(";")) {
        const eq = part.indexOf("=");
        if (eq === -1) continue;
        const key = part.slice(0, eq).trim();
        if (key === "access_token") return decodeURIComponent(part.slice(eq + 1).trim());
      }
    }
    return null;
  }

  // Returns the thread if the user is a participant, else null.
  private participantThread(userId: string, threadId: string) {
    return this.prisma.thread.findFirst({
      where: { id: threadId, OR: [{ brandId: userId }, { creatorUserId: userId }] },
      select: { id: true, brandId: true, creatorUserId: true },
    });
  }

  @SubscribeMessage("thread:join")
  async joinThread(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { threadId?: string },
  ): Promise<{ ok: boolean }> {
    const userId = socket.data.userId as string | undefined;
    if (!userId || !data?.threadId) return { ok: false };
    const thread = await this.participantThread(userId, data.threadId);
    if (!thread) return { ok: false };
    socket.join(`thread:${data.threadId}`);
    return { ok: true };
  }

  @SubscribeMessage("message:send")
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { threadId?: string; body?: unknown },
  ) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return { ok: false, error: "unauthenticated" };
    const body = typeof data?.body === "string" ? data.body : "";
    if (!data?.threadId || body.trim().length === 0 || body.length > 5000) {
      return { ok: false, error: "invalid" };
    }
    const thread = await this.participantThread(userId, data.threadId);
    if (!thread) return { ok: false, error: "forbidden" };
    const message = await this.messages.send(userId, data.threadId, body);
    this.broadcastMessage(data.threadId, message, [thread.brandId, thread.creatorUserId]);
    // Ack the sender with the persisted message.
    return message;
  }

  @SubscribeMessage("thread:read")
  async readThread(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { threadId?: string },
  ): Promise<{ ok: boolean }> {
    const userId = socket.data.userId as string | undefined;
    if (!userId || !data?.threadId) return { ok: false };
    const thread = await this.participantThread(userId, data.threadId);
    if (!thread) return { ok: false };
    await this.messages.markRead(userId, data.threadId);
    this.server.to(`thread:${data.threadId}`).emit("message:read", { threadId: data.threadId, userId });
    return { ok: true };
  }

  // Broadcast a message to the thread room and nudge each participant's inbox.
  // Public so the HTTP send path can reuse it (see MessagesController.send).
  broadcastMessage(threadId: string, message: unknown, participantIds: string[]) {
    this.server.to(`thread:${threadId}`).emit("message:new", message);
    for (const id of participantIds) {
      this.server.to(`user:${id}`).emit("thread:updated", { threadId });
    }
  }
}
