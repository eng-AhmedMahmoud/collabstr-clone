import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import cookieParser = require("cookie-parser");
import helmet from "helmet";
import { json } from "express";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/prisma-exception.filter";
import { assertEnv } from "./common/env";
import { originCheck } from "./common/origin-check";

async function bootstrap() {
  assertEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const port = Number(process.env.PORT ?? 4000);
  const origin = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim());

  // Behind a reverse proxy (portless locally, Vercel/nginx in prod) so
  // req.protocol / client IPs (throttler keys) come from X-Forwarded-*.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(originCheck(origin));
  app.enableCors({
    origin,
    credentials: true,
  });
  // /health stays unprefixed so the Vercel /health rewrite (and load
  // balancers) reach it without the /api/v1 prefix.
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(port);
  new Logger("Bootstrap").log(`API listening on http://localhost:${port}`);
}

bootstrap();
