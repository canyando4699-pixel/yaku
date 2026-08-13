import assert from "node:assert/strict";

/** Mirrors src/lib/auth/safeNextPath.ts for a zero-dep check. */
function safeNextPath(next, fallback = "/host") {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("\\") || next.includes("://")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}

assert.equal(safeNextPath(undefined), "/host");
assert.equal(safeNextPath(""), "/host");
assert.equal(safeNextPath("/host"), "/host");
assert.equal(safeNextPath("/b/demo/m/bk_1"), "/b/demo/m/bk_1");
assert.equal(safeNextPath("/host?tab=list"), "/host?tab=list");

assert.equal(safeNextPath("//evil.example"), "/host");
assert.equal(safeNextPath("//evil.example/phish"), "/host");
assert.equal(safeNextPath("https://evil.example"), "/host");
assert.equal(safeNextPath("/\\evil.example"), "/host");
assert.equal(safeNextPath("host"), "/host");
assert.equal(safeNextPath("/host\n"), "/host");

const base = "http://localhost:3000/login";
const malicious = "//evil.example/phish";
assert.equal(new URL(malicious, base).origin, "http://evil.example");
assert.notEqual(safeNextPath(malicious), malicious);

console.log("verify-safe-next-path: ok");
