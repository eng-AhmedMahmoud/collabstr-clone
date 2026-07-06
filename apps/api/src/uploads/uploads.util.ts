import { BadRequestException } from "@nestjs/common";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
import { randomBytes } from "crypto";

// Allowed image extensions + mimes for avatar uploads.
const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function makeAvatarName(originalname: string): string {
  const ext = extname(originalname).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new BadRequestException("Unsupported image type");
  return `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
}

// Store an avatar and return its public URL. On Vercel the filesystem is
// read-only, so uploads go to Vercel Blob (BLOB_READ_WRITE_TOKEN is injected
// by the connected store); locally we write to the uploads dir served by
// ServeStaticModule.
export async function storeAvatar(
  name: string,
  buffer: Buffer,
  contentType: string,
  localBase: string,
): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`avatars/${name}`, buffer, {
      access: "public",
      contentType,
      cacheControlMaxAge: 365 * 24 * 60 * 60,
    });
    return blob.url;
  }
  const dir = join(process.cwd(), AVATAR_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buffer);
  return `${localBase}/uploads/avatars/${name}`;
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
