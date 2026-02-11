import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserOrNull } from "@/lib/session";
import { parseHandHistory } from "@/lib/handHistory";

export async function POST(req: Request) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Session not initialized" }, { status: 401 });
  const body = await req.json();
  const opponentId = body.opponentId as string;
  const rawText = (body.rawText as string) ?? "";

  const opponent = await prisma.opponentProfile.findFirst({
    where: { id: opponentId, userId: user.id }
  });
  if (!opponent) return NextResponse.json({ error: "Opponent not found" }, { status: 404 });

  const delta = parseHandHistory(rawText);

  await prisma.handHistory.create({
    data: { opponentId, rawText }
  });

  const updated = await prisma.opponentProfile.update({
    where: { id: opponentId },
    data: {
      hands: opponent.hands + delta.hands,
      vpipCount: opponent.vpipCount + delta.vpip,
      pfrCount: opponent.pfrCount + delta.pfr,
      threeBetCount: opponent.threeBetCount + delta.threeBet,
      cbetCount: opponent.cbetCount + delta.cbet
    }
  });

  return NextResponse.json({ ok: true, updated });
}
