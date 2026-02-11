import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserOrNull } from "@/lib/session";
import { jsonStringify } from "@/lib/json";

export async function GET() {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Session not initialized" }, { status: 401 });
  const scenarios = await prisma.scenario.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(scenarios);
}

export async function POST(req: Request) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Session not initialized" }, { status: 401 });
  const body = await req.json();

  const scenario = await prisma.scenario.create({
    data: {
      userId: user.id,
      name: body.name ?? "Untitled",
      tableType: body.tableType ?? "6max",
      position: body.position ?? "BTN",
      villainPositionsJson: jsonStringify(body.villainPositions ?? [], "[]"),
      stackBb: Number(body.stackBb ?? 100),
      players: Number(body.players ?? 6),
      preflopAction: body.preflopAction ?? "SRP",
      preflopConfigJson: body.preflopConfig ? jsonStringify(body.preflopConfig) : null,
      trainingNode: body.trainingNode ?? "FLOP_CBET",
      flopTexture: body.flopTexture ?? "rainbow",
      flopTextureWeightsJson: jsonStringify(body.flopTextureWeights ?? { rainbow: 1, twoTone: 1, paired: 1 }),
      boardProfileWeightsJson: jsonStringify(body.boardProfileWeights ?? {}),
      opponentTagsJson: jsonStringify(body.opponentTags ?? [], "[]"),
      weight: Number(body.weight ?? 1)
    }
  });

  return NextResponse.json(scenario);
}
