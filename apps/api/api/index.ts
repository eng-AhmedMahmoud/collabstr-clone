import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter, type NestExpressApplication } from "@nestjs/platform-express";
import cookieParser = require("cookie-parser");
import express from "express";
import type { Request, Response } from "express";
import { AppModule } from "../src/app.module";

const server = express();
let ready: Promise<express.Express> | null = null;

async function bootstrap(): Promise<express.Express> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    { bufferLogs: true },
  );
  const origin = (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(cookieParser());
  app.enableCors({
    origin: origin.length === 1 && origin[0] === "*" ? true : origin,
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");
  await app.init();
  return server;
}

export default async function handler(req: Request, res: Response) {
  if (!ready) ready = bootstrap();
  const app = await ready;
  return app(req, res);
}
