import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.scenario.count();
  if (existing > 0) return;

  await prisma.scenario.createMany({
    data: [
      {
        name: "BTN 4bet pot vs 2 callers",
        position: "BTN",
        stackBb: 100,
        players: 6,
        preflopAction: "BTN 4bet pot vs 2 callers",
        flopTexture: "two-tone",
        flopTextureWeights: { twoTone: 0.6, rainbow: 0.25, paired: 0.15 },
        opponentTags: ["sticky", "aggro"],
        weight: 2
      },
      {
        name: "SB open vs BB defend",
        position: "SB",
        stackBb: 80,
        players: 2,
        preflopAction: "SB open vs BB defend",
        flopTexture: "rainbow",
        flopTextureWeights: { twoTone: 0.35, rainbow: 0.5, paired: 0.15 },
        opponentTags: ["tight"],
        weight: 1
      },
      {
        name: "CO open vs BTN 3bet",
        position: "CO",
        stackBb: 120,
        players: 6,
        preflopAction: "CO open vs BTN 3bet",
        flopTexture: "paired",
        flopTextureWeights: { twoTone: 0.3, rainbow: 0.3, paired: 0.4 },
        opponentTags: ["reg", "balanced"],
        weight: 1
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
