import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";

// "Drill this spot more": create a child scenario with increased weight.
export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const { handId } = await req.json();

  const hand = await prisma.drillHand.findFirst({
    where: { id: handId, session: { userId: user.id } },
    include: { scenario: true }
  });
  if (!hand) return NextResponse.json({ error: "Hand not found" }, { status: 404 });

  const parent = hand.scenario;

  const child = await prisma.scenario.create({
    data: {
      userId: user.id,
      parentId: parent.id,
      name: `${parent.name} (focus: ${hand.boardTexture})`,
      position: parent.position,
      stackBb: parent.stackBb,
      players: parent.players,
      preflopAction: parent.preflopAction,
      flopTexture: parent.flopTexture,
      flopTextureWeights: parent.flopTextureWeights,
      opponentTags: parent.opponentTags,
      weight: Math.min(parent.weight + 2, 20)
    }
  });

  return NextResponse.json({ ok: true, childScenarioId: child.id });
}
