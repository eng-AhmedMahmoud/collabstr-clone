import { API_BASE, API_PREFIX, ApiError, tokens } from "./client";
import { getCurrentLocale } from "@/i18n/context";

// FormData multipart upload — react-query's fetch wrapper doesn't set the
// right Content-Type for us; browsers + RN both need us to omit it so the
// runtime writes the correct multipart boundary.

export async function uploadAvatar(asset: { uri: string; name?: string; mimeType?: string }): Promise<{ url: string }> {
  const { access } = await tokens.get();
  const form = new FormData();
  const filename = asset.name || asset.uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
  const type = asset.mimeType || guessMime(filename);
  // RN's FormData accepts { uri, name, type } — TypeScript's web FormData type
  // doesn't model that, so we cast to any.
  form.append("file", { uri: asset.uri, name: filename, type } as any);

  const headers: Record<string, string> = {
    "Accept-Language": getCurrentLocale(),
  };
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${API_BASE}${API_PREFIX}/users/me/avatar`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const msg = (body as any)?.message || res.statusText || `HTTP ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(", ") : msg, body);
  }
  return (await res.json()) as { url: string };
}

function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}
