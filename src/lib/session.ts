// Login sessions as a signed, HTTP-only JWT cookie: no server-side store, so
// it works across serverless instances.
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "lc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // one week

export interface Session {
  customerId: number;
  userId: string;
  name: string;
  isAdmin: boolean;
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    if (process.env.VERCEL_ENV === "production") {
      console.warn("[session] SESSION_SECRET is not set; using an insecure fallback. Set it in Vercel ▸ Settings ▸ Environment Variables.");
    }
    return new TextEncoder().encode("lucas-check-demo-secret-not-for-production");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      customerId: Number(payload.customerId),
      userId: String(payload.userId),
      name: String(payload.name),
      isAdmin: Boolean(payload.isAdmin),
    };
  } catch {
    return null; // expired or tampered
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
