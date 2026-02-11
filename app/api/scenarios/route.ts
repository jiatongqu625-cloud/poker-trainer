import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";

export async function GET() {
  const user = await getOrCreateUser();
  const scenarios = await prisma.scenario.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(scenarios);
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const body = await req.json();

  const scenario = await prisma.scenario.create({
    data: {
      userId: user.id,
      name: body.name ?? "Untitled",
      tableType: body.tableType ?? "6max",
      position: body.position ?? "BTN",
      villainPositions: body.villainPositions ?? [],
      stackBb: Number(body.stackBb ?? 100),
      players: Number(body.players ?? 6),
      preflopAction: body.preflopAction ?? "SRP",
      preflopConfig: body.preflopConfig ?? null,
      trainingNode: body.trainingNode ?? "FLOP",
      flopTexture: body.flopTexture ?? "rainbow",
      flopTextureWeights: body.flopTextureWeights ?? { rainbow: 1, twoTone: 1, paired: 1 },
      boardProfileWeights: body.boardProfileWeights ?? {},
      opponentTags: body.opponentTags ?? [],
      weight: Number(body.weight ?? 1)
    }
  });

  return NextResponse.json(scenario);
}
