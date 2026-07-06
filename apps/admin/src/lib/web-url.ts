// Single source of truth for the public marketplace URL.
// Set NEXT_PUBLIC_WEB_URL in each environment; the fallbacks only cover
// local dev (portless hostname) and the current Vercel deployment.
export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://collabstr-clone.vercel.app"
    : "https://collabstr-web.localhost");
