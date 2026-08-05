import "./instrument"; // must stay first — Sentry instruments everything loaded after it
import "reflect-metadata";
import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import cookieParser = require("cookie-parser");
import helmet from "helmet";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";
import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/prisma-exception.filter";
import { assertEnv } from "./common/env";
import { originCheck } from "./common/origin-check";

async function bootstrap() {
  assertEnv();
  // rawBody + bodyParser:false + useBodyParser below: PSP webhook signatures
  // are computed over the raw bytes, so req.rawBody must be captured while
  // keeping the previous 1mb JSON limit.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
    bodyParser: false,
  });
  const port = Number(process.env.PORT ?? 4000);
  const origin = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim());

  // Behind a reverse proxy (portless locally, Vercel/nginx in prod) so
  // req.protocol / client IPs (throttler keys) come from X-Forwarded-*.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.useBodyParser("json", { limit: "1mb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "1mb" });
  app.use(cookieParser());
  app.use(originCheck(origin));
  app.enableCors({
    origin,
    credentials: true,
  });
  // /health stays unprefixed so the Vercel /health rewrite (and load
  // balancers) reach it without the /api/v1 prefix.
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  // Filters are evaluated in reverse registration order, so PrismaExceptionFilter
  // (registered last) keeps precedence for Prisma errors; Sentry's catch-all only
  // sees what Prisma doesn't map. Skipped entirely without a DSN.
  if (process.env.SENTRY_DSN) {
    app.useGlobalFilters(
      new SentryGlobalFilter(app.get(HttpAdapterHost).httpAdapter),
      new PrismaExceptionFilter(),
    );
  } else {
    app.useGlobalFilters(new PrismaExceptionFilter());
  }
  app.enableShutdownHooks();

  await app.listen(port);
  new Logger("Bootstrap").log(`API listening on http://localhost:${port}`);
}

bootstrap();
