import type { NextFunction, Request, Response } from "express";

// CSRF guard for cookie-authenticated clients: browsers always attach Origin
// to cross-site POST/PATCH/DELETE, so a state-changing request whose Origin is
// present but not in the allowlist is a cross-site forgery — reject it before
// it reaches any handler. Requests without Origin (mobile apps, curl, server
// to server) pass through; they authenticate with Bearer tokens, which cannot
// be forged cross-site.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function originCheck(allowlist: string[]) {
  const allowed = new Set(allowlist.map((o) => o.replace(/\/$/, "")));
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.headers.origin;
    if (!origin || allowed.has(origin.replace(/\/$/, ""))) return next();
    res.status(403).json({ message: "Origin not allowed" });
  };
}
