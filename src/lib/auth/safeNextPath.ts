/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative URLs (`//evil.com`) that pass a naive
 * `startsWith("/")` check and would hard-navigate off-site via the App Router.
 */
export function safeNextPath(
  next: string | undefined | null,
  fallback = "/host",
): string {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("\\") || next.includes("://")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}
