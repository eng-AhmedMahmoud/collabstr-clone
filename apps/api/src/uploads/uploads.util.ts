import { BadRequestException } from "@nestjs/common";
import { extname } from "path";
import { randomBytes } from "crypto";

// Allowed image extensions + mimes for avatar uploads.
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function avatarFilename(_req: unknown, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    cb(new BadRequestException("Unsupported image type"), "");
    return;
  }
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  cb(null, name);
}

export function avatarFileFilter(_req: unknown, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new BadRequestException("Unsupported image type"), false);
    return;
  }
  cb(null, true);
}

export const AVATAR_LIMITS = { fileSize: 4 * 1024 * 1024 }; // 4 MB
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const AVATAR_DIR = `${UPLOAD_DIR}/avatars`;
