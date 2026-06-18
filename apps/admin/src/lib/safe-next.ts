// Constrain `next=` redirect targets to same-origin relative paths.
// Anything that could resolve off-origin (protocol-relative, absolute URL,
// backslashes) collapses to "/" — never trust the query string.
export function safeNext(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "/";
  if (!input.startsWith("/")) return "/";
  if (input.startsWith("//") || input.startsWith("/\\")) return "/";
  if (input.includes("\\")) return "/";
  return input;
}
