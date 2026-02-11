import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.scenario.count();
  if (existing > 0) return;

  await prisma.scenario.createMany({
    data: [
      {
        name: "BTN 4BP vs 2 callers (flop IP c-bet)",
        tableType: "6max",
        position: "BTN",
        villainPositionsJson: JSON.stringify(["SB", "BB"]),
        stackBb: 100,
        players: 6,
        preflopAction: "4BP | Aggressor BTN | Hero BTN | Callers 2 | Vs SB,BB",
        preflopConfigJson: JSON.stringify({
          potType: "4BP",
          aggressor: "BTN",
          heroPos: "BTN",
          villains: ["SB", "BB"],
          callers: 2,
          trainingNode: "FLOP_IP_CBET"
        }),
        trainingNode: "FLOP_IP_CBET",
        flopTexture: "two-tone",
        flopTextureWeightsJson: JSON.stringify({ twoTone: 0.6, rainbow: 0.25, paired: 0.15 }),
        boardProfileWeightsJson: JSON.stringify({ dry: 0.35, wet: 0.65, high: 0.6, low: 0.4 }),
        opponentTagsJson: JSON.stringify(["sticky", "aggro"]),
        weight: 2
      },
      {
        name: "SB vs BB (SRP flop OOP c-bet)",
        tableType: "6max",
        position: "SB",
        villainPositionsJson: JSON.stringify(["BB"]),
        stackBb: 80,
        players: 2,
        preflopAction: "SRP | Aggressor SB | Hero SB | Callers 1 | Vs BB",
        preflopConfigJson: JSON.stringify({
          potType: "SRP",
          aggressor: "SB",
          heroPos: "SB",
          villains: ["BB"],
          callers: 1,
          trainingNode: "FLOP_OOP_CBET"
        }),
        trainingNode: "FLOP_OOP_CBET",
        flopTexture: "rainbow",
        flopTextureWeightsJson: JSON.stringify({ twoTone: 0.35, rainbow: 0.5, paired: 0.15 }),
        boardProfileWeightsJson: JSON.stringify({ dry: 0.6, wet: 0.4, high: 0.5, low: 0.5 }),
        opponentTagsJson: JSON.stringify(["tight"]),
        weight: 1
      },
      {
        name: "CO vs BTN 3BP (flop IP vs c-bet)",
        tableType: "6max",
        position: "CO",
        villainPositionsJson: JSON.stringify(["BTN"]),
        stackBb: 120,
        players: 6,
        preflopAction: "3BP | Aggressor BTN | Hero CO | Callers 1 | Vs BTN",
        preflopConfigJson: JSON.stringify({
          potType: "3BP",
          aggressor: "BTN",
          heroPos: "CO",
          villains: ["BTN"],
          callers: 1,
          trainingNode: "FLOP_IP_VS_CBET"
        }),
        trainingNode: "FLOP_IP_VS_CBET",
        flopTexture: "paired",
        flopTextureWeightsJson: JSON.stringify({ twoTone: 0.3, rainbow: 0.3, paired: 0.4 }),
        boardProfileWeightsJson: JSON.stringify({ dry: 0.45, wet: 0.55, high: 0.55, low: 0.45 }),
        opponentTagsJson: JSON.stringify(["reg", "balanced"]),
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
