import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";

export async function GET() {
  const user = await getOrCreateUser();
  const opponents = await prisma.opponentProfile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(opponents);
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const body = await req.json();

  const opponent = await prisma.opponentProfile.create({
    data: {
      userId: user.id,
      name: body.name ?? "Opponent",
      notes: body.notes ?? ""
    }
  });

  return NextResponse.json(opponent);
}
