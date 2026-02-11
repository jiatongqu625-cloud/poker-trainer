import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

const SESSION_COOKIE = "pt_session";

export async function getOrCreateUser() {
  const cookieStore = cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;

  if (existing) {
    const user = await prisma.user.findUnique({ where: { sessionId: existing } });
    if (user) return user;
  }

  const sessionId = crypto.randomUUID();
  const user = await prisma.user.create({ data: { sessionId } });
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return user;
}
