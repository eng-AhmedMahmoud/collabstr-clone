import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter, type NestExpressApplication } from "@nestjs/platform-express";
import cookieParser = require("cookie-parser");
import express from "express";
import helmet from "helmet";
import type { Request, Response } from "express";
import { AppModule } from "../src/app.module";
import { PrismaExceptionFilter } from "../src/common/prisma-exception.filter";
import { assertEnv } from "../src/common/env";
import { originCheck } from "../src/common/origin-check";

const server = express();
let ready: Promise<express.Express> | null = null;

async function bootstrap(): Promise<express.Express> {
  assertEnv();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    { bufferLogs: true },
  );
  // This API is cookie-authenticated, so a reflected/wildcard origin with
  // credentials would hand every website credentialed access. Fail closed:
  // CORS_ORIGIN must be an explicit allowlist (assertEnv enforces it in prod).
  const origin = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "*");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(originCheck(origin));
  app.enableCors({
    origin,
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return server;
}

export default async function handler(req: Request, res: Response) {
  if (!ready) ready = bootstrap();
  const app = await ready;
  return app(req, res);
}
