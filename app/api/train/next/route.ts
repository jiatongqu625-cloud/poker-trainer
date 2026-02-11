import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import { generateSpot, gradeAction, type ActionToken } from "@/lib/engine";
import { allowedActionsForNode } from "@/lib/actions";
import { restrictStrategy } from "@/lib/strategy";
import { safeJsonParse, jsonStringify } from "@/lib/json";

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
    preflopConfig: safeJsonParse<any>((scenario as any).preflopConfigJson, null),
    trainingNode: (scenario as any).trainingNode ?? "FLOP_CBET",
    flopTexture: scenario.flopTexture,
    flopTextureWeights: safeJsonParse<Record<string, number>>((scenario as any).flopTextureWeightsJson, {}),
    boardProfileWeights: safeJsonParse<Record<string, number>>((scenario as any).boardProfileWeightsJson, {}),
    opponentTags: safeJsonParse<string[]>((scenario as any).opponentTagsJson, [])
  });

  const node = (scenario as any).trainingNode ?? "FLOP_CBET";
  const allowedActions = allowedActionsForNode(node);
  const allowedTokens = allowedActions.map((a) => a.value as ActionToken);
  const recommendedStrategy = restrictStrategy(spot.recommendedStrategy as any, allowedTokens);

  const spotPayload = {
    board: spot.board,
    texture: spot.texture,
    node,
    boardProfile: spot.boardProfile,
    spr: spot.spr,
    explanation: spot.explanation
  };

  const hand = await prisma.drillHand.create({
    data: {
      sessionId: session.id,
      scenarioId: scenario.id,
      heroHand: spot.heroHand,
      boardTexture: spot.texture,
      recommendedStrategyJson: jsonStringify(recommendedStrategy),
      recommendationReason: spot.reason,
      spotJson: jsonStringify(spotPayload)
    }
  });

  return NextResponse.json({
    id: hand.id,
    heroHand: hand.heroHand,
    board: (spotPayload as any)?.board,
    texture: hand.boardTexture,
    node,
    allowedActions,
    boardProfile: (spotPayload as any)?.boardProfile ?? [],
    spr: (spotPayload as any)?.spr ?? null,
    recommendedStrategy,
    reason: hand.recommendationReason,
    explanation: (spotPayload as any)?.explanation ?? null
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

  const spotObj = safeJsonParse<any>((hand as any).spotJson, {});
  const node = spotObj?.node ?? "FLOP_CBET";
  const allowedActions = allowedActionsForNode(node);
  const allowedTokens = allowedActions.map((a) => a.value as ActionToken);

  const recStrategy = safeJsonParse<any>((hand as any).recommendedStrategyJson, {});
  const result = gradeAction(userAction as ActionToken, recStrategy, allowedTokens);

  const updated = await prisma.drillHand.update({
    where: { id: hand.id },
    data: { userAction: userAction as string, result }
  });

  const spotObj2 = safeJsonParse<any>((updated as any).spotJson, {});
  const node2 = spotObj2?.node ?? "FLOP_CBET";
  const allowedActions2 = allowedActionsForNode(node2);

  return NextResponse.json({
    id: updated.id,
    heroHand: updated.heroHand,
    board: spotObj2?.board,
    texture: updated.boardTexture,
    node: node2,
    allowedActions: allowedActions2,
    boardProfile: spotObj2?.boardProfile ?? [],
    spr: spotObj2?.spr ?? null,
    recommendedStrategy: recStrategy,
    reason: updated.recommendationReason,
    explanation: spotObj2?.explanation ?? null,
    userAction: updated.userAction,
    result: updated.result
  });
}
