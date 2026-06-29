import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@/types/user";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  firebaseUid: string;
  email: string;
  role: UserRole;
  expiresAt: string;
}

/**
 * Sign a session payload into a JWT
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Verify a JWT session token and return the payload
 */
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Set the secure HTTP-only session cookie
 */
export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await encrypt({ ...payload, expiresAt: expires.toISOString() });

  cookies().set("civora_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expires,
    path: "/",
  });
}

/**
 * Clear the session cookie (logout)
 */
export async function deleteSession() {
  cookies().delete("civora_session");
}

/**
 * Get the current session payload from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get("civora_session")?.value;
  if (!token) return null;
  return await decrypt(token);
}
