export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  displayName: string;
};

const ACCOUNTS_KEY = "yaku-accounts";
const SESSION_KEY = "yaku-session";

/** Local demo login — always seeded into this browser. */
export const DEMO_ACCOUNT = {
  email: "demo@yaku.app",
  password: "yaku123",
  displayName: "Yaku Demo",
} as const;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAccounts(): AuthUser[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: AuthUser[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function makeSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.userId || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; error: "exists" | "invalid" | "mismatch" | "weak" };

export async function signUp(input: {
  email: string;
  displayName: string;
  password: string;
  passwordConfirm: string;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!email || !displayName || input.password.length < 6) {
    return { ok: false, error: "weak" };
  }
  if (input.password !== input.passwordConfirm) {
    return { ok: false, error: "mismatch" };
  }

  const accounts = readAccounts();
  if (accounts.some((a) => a.email === email)) {
    return { ok: false, error: "exists" };
  }

  const salt = makeSalt();
  const passwordHash = await hashPassword(input.password, salt);
  const user: AuthUser = {
    id: crypto.randomUUID(),
    email,
    displayName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, user]);

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  };
  setSession(session);
  return { ok: true, session };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  await ensureDemoAccount();
  const email = input.email.trim().toLowerCase();
  const accounts = readAccounts();
  const user = accounts.find((a) => a.email === email);
  if (!user) return { ok: false, error: "invalid" };

  const passwordHash = await hashPassword(input.password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "invalid" };
  }

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  };
  setSession(session);
  return { ok: true, session };
}

export function signOut() {
  clearSession();
}

export async function ensureDemoAccount() {
  if (!canUseStorage()) return;
  const accounts = readAccounts();
  if (accounts.some((a) => a.email === DEMO_ACCOUNT.email)) return;

  const salt = makeSalt();
  const passwordHash = await hashPassword(DEMO_ACCOUNT.password, salt);
  const user: AuthUser = {
    id: "yaku-demo-user",
    email: DEMO_ACCOUNT.email,
    displayName: DEMO_ACCOUNT.displayName,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, user]);
}
