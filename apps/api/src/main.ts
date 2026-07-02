import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import cookieParser = require("cookie-parser");
import helmet from "helmet";
import { json } from "express";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/prisma-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number(process.env.PORT ?? 4000);
  const origin = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim());

  app.use(helmet());
  app.use(json({ limit: "1mb" }));
  app.use(cookieParser());
  app.enableCors({
    origin,
    credentials: true,
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();

  await app.listen(port);
  new Logger("Bootstrap").log(`API listening on http://localhost:${port}`);
}

bootstrap();
