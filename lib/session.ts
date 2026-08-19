import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type SessionUser = {
  userId: string;
  provider: "google" | "linkedin";
  email: string;
  name: string;
  picture: string;
};

const COOKIE = "lq_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  return process.env.SESSION_SECRET || "local-dev-session-secret";
}

function encode(payload: SessionUser) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function decode(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (!parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    return { session: null as SessionUser | null, error: NextResponse.json({ error: "Sign in first" }, { status: 401 }) };
  }
  return { session, error: null };
}

export { COOKIE as SESSION_COOKIE };
