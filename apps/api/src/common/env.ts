// Fail fast at boot instead of at first use deep inside a request.
const REQUIRED = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;

export function assertEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  if (process.env.NODE_ENV === "production") {
    const placeholders = REQUIRED.filter((k) => /^change-me/i.test(process.env[k] ?? ""));
    if (placeholders.length) {
      throw new Error(`Placeholder values in production for: ${placeholders.join(", ")}`);
    }
    if (!process.env.CORS_ORIGIN) {
      throw new Error("CORS_ORIGIN must be set explicitly in production");
    }
  }
}
