export type SpotInput = {
  scenarioId: string;
  position: string;
  stackBb: number;
  players: number;
  preflopAction: string;
  preflopConfig?: any;
  trainingNode?: string;
  flopTexture: string;
  flopTextureWeights: Record<string, number>;
  boardProfileWeights?: Record<string, number>;
  opponentTags: string[];
};

export type ActionToken = "CHECK" | "BET_25" | "BET_33" | "BET_66" | "BET_75";

export type MixedStrategy = Record<ActionToken, number>;

export type SpotOutput = {
  heroHand: string;
  board: string;
  texture: string;
  boardProfile: string[];
  spr: number;
  recommendedStrategy: MixedStrategy;
  reason: string;
  explanation: {
    bullets: string[];
    glossary: string[];
  };
};

const HERO_HANDS = [
  "AA",
  "KK",
  "QQ",
  "JJ",
  "TT",
  "99",
  "AKs",
  "AQs",
  "A5s",
  "KQs",
  "KJs",
  "QJs",
  "JTs",
  "ATo",
  "KQo"
];

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = ["h", "d", "c", "s"];

function pickWeighted(weights: Record<string, number>, fallback: string) {
  const entries = Object.entries(weights ?? {});
  if (!entries.length) return fallback;
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  const roll = Math.random() * total;
  let acc = 0;
  for (const [key, weight] of entries) {
    acc += weight;
    if (roll <= acc) return key;
  }
  return fallback;
}

function randomHand() {
  return HERO_HANDS[Math.floor(Math.random() * HERO_HANDS.length)];
}

function randomCard(exclude: Set<string>) {
  let card = "";
  do {
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    card = `${rank}${suit}`;
  } while (exclude.has(card));
  exclude.add(card);
  return card;
}

function buildBoard(texture: string) {
  const used = new Set<string>();
  if (texture === "paired") {
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    const suit1 = SUITS[Math.floor(Math.random() * SUITS.length)];
    const suit2 = SUITS.filter((s) => s !== suit1)[Math.floor(Math.random() * 3)];
    used.add(`${rank}${suit1}`);
    used.add(`${rank}${suit2}`);
    const kicker = randomCard(used);
    return `${rank}${suit1} ${rank}${suit2} ${kicker}`;
  }

  if (texture === "twoTone" || texture === "two-tone") {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const offSuit = SUITS.filter((s) => s !== suit)[Math.floor(Math.random() * 3)];
    const card1 = `${RANKS[Math.floor(Math.random() * RANKS.length)]}${suit}`;
    const card2 = `${RANKS[Math.floor(Math.random() * RANKS.length)]}${suit}`;
    const card3 = `${RANKS[Math.floor(Math.random() * RANKS.length)]}${offSuit}`;
    return `${card1} ${card2} ${card3}`;
  }

  const cards = [randomCard(used), randomCard(used), randomCard(used)];
  return cards.join(" ");
}

function estimatePotAtFlopBb(potType: string, callers: number) {
  // Very rough MVP estimates (bb). Intended for explanation, not precision.
  const c = Math.max(0, Number(callers ?? 0));
  if (potType === "4BP") return 40 + c * 12;
  if (potType === "3BP") return 18 + c * 6;
  return 6.5 + c * 2.5; // SRP baseline
}

function safeNumber(n: any, fallback: number) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function recommendStrategy(input: SpotInput, texture: string): { strategy: MixedStrategy; reason: string; bullets: string[]; glossary: string[]; spr: number } {
  const base = input.preflopAction.toLowerCase();
  const tags = input.opponentTags.map((t) => t.toLowerCase());

  const potType = String(input.preflopConfig?.potType ?? "SRP");
  const callers = safeNumber(input.preflopConfig?.callers, 1);
  const potAtFlop = estimatePotAtFlopBb(potType, callers);
  const spr = input.stackBb / Math.max(1, potAtFlop);

  const bullets = [
    `Pot type: ${potType}. Estimated pot at flop: ~${potAtFlop.toFixed(1)}bb.`,
    `Effective stack: ${input.stackBb}bb → SPR ≈ ${spr.toFixed(1)}.`
  ];

  const glossary = ["SPR", potType];

  // NOTE: MVP heuristic strategy. Replaceable with solver-backed engine later.
  if (texture === "paired") {
    return {
      strategy: { CHECK: 0.35, BET_25: 0.55, BET_75: 0.1, BET_33: 0, BET_66: 0 },
      reason: "Paired boards often reduce nut advantage. Mixed small c-bets keep ranges wide.",
      bullets: [...bullets, "Paired textures often reduce strong hand density, so small bets + checks are common."],
      glossary: [...glossary, "CBet", "RangeBet"],
      spr
    };
  }

  if (texture === "twoTone" || texture === "two-tone") {
    return {
      strategy: { CHECK: 0.5, BET_33: 0.35, BET_75: 0.15, BET_25: 0, BET_66: 0 },
      reason: "Two-tone boards add flush draws: increase checking and keep some big bets.",
      bullets: [...bullets, "Flush draws increase the value of checking and protect your checking range."],
      glossary: [...glossary, "CBet"],
      spr
    };
  }

  if (potType === "4BP" || base.includes("4bet")) {
    return {
      strategy: { CHECK: 0.25, BET_25: 0.6, BET_75: 0.15, BET_33: 0, BET_66: 0 },
      reason: "4-bet pots are typically low SPR and range-constrained; small bets are common.",
      bullets: [...bullets, "Low SPR spots often support more betting with strong overpairs/top pairs."],
      glossary: [...glossary, "CBet"],
      spr
    };
  }

  if (tags.includes("sticky")) {
    return {
      strategy: { CHECK: 0.25, BET_66: 0.45, BET_75: 0.3, BET_25: 0, BET_33: 0 },
      reason: "Versus sticky opponents, shift toward larger polarized betting.",
      bullets: [...bullets, "If villain overcalls, larger sizings extract more value and pressure draws."],
      glossary: [...glossary, "Polar"],
      spr
    };
  }

  return {
    strategy: { CHECK: 0.3, BET_33: 0.55, BET_75: 0.15, BET_25: 0, BET_66: 0 },
    reason: "Default heuristic: mostly small c-bet with some checks and occasional big bets.",
    bullets: [...bullets, "On neutral textures, small c-bets are a common baseline in many game trees."],
    glossary,
    spr
  };
}

export function generateSpot(input: SpotInput): SpotOutput {
  const texture = pickWeighted(
    input.flopTextureWeights,
    input.flopTexture || "rainbow"
  );

  // Extra board labels (MVP). Not used for generation yet, but used for training explanations.
  const boardProfileWeights = input.boardProfileWeights ?? {};
  const dryness = pickWeighted({ dry: boardProfileWeights.dry ?? 1, wet: boardProfileWeights.wet ?? 1 }, "dry");
  const highness = pickWeighted({ high: boardProfileWeights.high ?? 1, low: boardProfileWeights.low ?? 1 }, "high");
  const boardProfile = [dryness, highness];

  const heroHand = randomHand();
  const board = buildBoard(texture);
  const recommendation = recommendStrategy(input, texture);

  return {
    heroHand,
    board,
    texture,
    boardProfile,
    spr: recommendation.spr,
    recommendedStrategy: recommendation.strategy,
    reason: recommendation.reason,
    explanation: {
      bullets: recommendation.bullets,
      glossary: recommendation.glossary
    }
  };
}

function topAction(strategy: MixedStrategy): ActionToken {
  let best: ActionToken = "CHECK";
  let bestW = -1;
  (Object.keys(strategy) as ActionToken[]).forEach((k) => {
    const w = strategy[k] ?? 0;
    if (w > bestW) {
      bestW = w;
      best = k;
    }
  });
  return best;
}

export function gradeAction(userAction: ActionToken, strategy: MixedStrategy) {
  const top = topAction(strategy);
  if (userAction === top) return "CORRECT" as const;

  const w = strategy[userAction] ?? 0;
  // Treat "in-range" action as deviation, not hard-wrong.
  if (w >= 0.15) return "DEVIATION" as const;

  return "WRONG" as const;
}
