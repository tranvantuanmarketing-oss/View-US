import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  web_domain: string;
}

export interface SessionPayload extends SessionUser {
  exp: number; // Unix timestamp in seconds
}

const COOKIE_NAME = "reels_studio_session";
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecretKey(): string {
  return process.env.SESSION_SECRET || "reels-studio-v2-dev-fallback-secret-key-32chars";
}

/**
 * Sign payload with HMAC-SHA256
 */
export function signSession(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signed session string
 */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(body)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get current session user on the server (from cookies)
 */
export const LOCAL_OWNER: SessionPayload = {
  id: "owner",
  name: "Chủ hệ thống",
  email: "owner@local",
  role: "admin",
  web_domain: "local",
  exp: Math.floor(Date.now() / 1000) + 365 * 86400,
};

export async function getSession(): Promise<SessionPayload | null> {

  return LOCAL_OWNER;
}

export const getCurrentUser = getSession;

/**
 * Server-side route authorization check - single user local owner
 */
export async function authenticateApi(): Promise<
  { user: SessionPayload; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getSession();
  return { user: user || LOCAL_OWNER };
}

/**
 * Enforce Admin role on API routes - single user is always Admin
 */
export async function requireAdminApi(): Promise<
  { user: SessionPayload; errorResponse?: never } | { user?: never; errorResponse: NextResponse }
> {
  const user = await getSession();
  return { user: user || LOCAL_OWNER };
}

export async function requireAuth(roles?: Array<"admin" | "staff">): Promise<SessionPayload> {
  const user = await getSession();
  return user || LOCAL_OWNER;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

