import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { generateSpot, gradeAction, type ActionToken } from "@/lib/engine";

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const { scenarioId } = await req.json();

  const scenario = await prisma.scenario.findFirst({
    where: {
      id: scenarioId,
      OR: [{ userId: user.id }, { userId: null }]
    }
  });
  if (!scenario) return NextResponse.json({ error: "Scenario not found" }, { status: 404 });

  const session = await prisma.drillSession.create({
    data: { userId: user.id, scenarioId: scenario.id }
  });

  const spot = generateSpot({
    scenarioId: scenario.id,
    position: scenario.position,
    stackBb: scenario.stackBb,
    players: scenario.players,
    preflopAction: scenario.preflopAction,
    flopTexture: scenario.flopTexture,
    flopTextureWeights: (scenario.flopTextureWeights as any) ?? {},
    opponentTags: (scenario.opponentTags as any) ?? []
  });

  const hand = await prisma.drillHand.create({
    data: {
      sessionId: session.id,
      scenarioId: scenario.id,
      heroHand: spot.heroHand,
      boardTexture: spot.texture,
      recommendedStrategy: spot.recommendedStrategy as any,
      recommendationReason: spot.reason,
      spot: {
        board: spot.board,
        texture: spot.texture
      }
    }
  });

  return NextResponse.json({
    id: hand.id,
    heroHand: hand.heroHand,
    board: (hand.spot as any)?.board,
    texture: hand.boardTexture,
    recommendedStrategy: hand.recommendedStrategy,
    reason: hand.recommendationReason
  });
}

export async function PATCH(req: Request) {
  const user = await getOrCreateUser();
  const { handId, userAction } = await req.json();

  const hand = await prisma.drillHand.findFirst({
    where: {
      id: handId,
      session: { userId: user.id }
    }
  });
  if (!hand) return NextResponse.json({ error: "Hand not found" }, { status: 404 });

  const result = gradeAction(userAction as ActionToken, hand.recommendedStrategy as any);

  const updated = await prisma.drillHand.update({
    where: { id: hand.id },
    data: { userAction: userAction as string, result }
  });

  return NextResponse.json({
    id: updated.id,
    heroHand: updated.heroHand,
    board: (updated.spot as any)?.board,
    texture: updated.boardTexture,
    recommendedStrategy: updated.recommendedStrategy,
    reason: updated.recommendationReason,
    userAction: updated.userAction,
    result: updated.result
  });
}
