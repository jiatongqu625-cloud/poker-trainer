import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "pt_session";

// NOTE: Server Components cannot set cookies in Next.js 15.
// Cookie creation/setting happens via /api/session.
export async function getUserOrNull() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const user = await prisma.user.findUnique({ where: { sessionId } });
  return user;
}
