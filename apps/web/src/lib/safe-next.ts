// Constrain `next=` redirect targets to same-origin relative paths.
// Anything that could resolve off-origin (protocol-relative, absolute URL,
// backslashes) collapses to fallback — never trust the query string.
export function safeNext(input: string | undefined | null, fallback = "/"): string {
  if (!input || typeof input !== "string") return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//") || input.startsWith("/\\")) return fallback;
  if (input.includes("\\")) return fallback;
  return input;
}
