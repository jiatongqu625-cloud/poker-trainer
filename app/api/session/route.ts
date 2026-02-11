import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "pt_session";

export async function GET() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  // Ensure user exists for this sessionId.
  const existing = await prisma.user.findUnique({ where: { sessionId } });
  if (!existing) {
    await prisma.user.create({ data: { sessionId } });
  }

  const res = NextResponse.json({ ok: true, sessionId });
  // Setting cookies is allowed in route handlers.
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return res;
}
