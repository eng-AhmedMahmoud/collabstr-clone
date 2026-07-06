import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";

/**
 * Maps known Prisma errors to proper HTTP responses instead of leaking a 500
 * with internal query details. Anything unrecognised falls through as 500
 * with a generic message — the original error only goes to the server log.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Malformed values that slipped past DTO validation (bad enum, wrong type)
    // are client errors, not server faults — and their messages embed query
    // internals that must not leak.
    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(`Prisma validation error: ${exception.message.split("\n").pop()}`);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request data",
        error: "Bad Request",
      });
      return;
    }

    switch (exception.code) {
      case "P2002": {
        const target = Array.isArray(exception.meta?.target)
          ? (exception.meta.target as string[]).join(", ")
          : "field";
        res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${target} already exists`,
          error: "Conflict",
        });
        return;
      }
      case "P2025":
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Record not found",
          error: "Not Found",
        });
        return;
      case "P2003":
        res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Related record does not exist",
          error: "Bad Request",
        });
        return;
      default:
        this.logger.error(`Unhandled Prisma error ${exception.code}: ${exception.message}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Internal server error",
          error: "Internal Server Error",
        });
    }
  }
}
