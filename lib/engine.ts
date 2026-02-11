export type SpotInput = {
  scenarioId: string;
  position: string;
  stackBb: number;
  players: number;
  preflopAction: string;
  flopTexture: string;
  flopTextureWeights: Record<string, number>;
  opponentTags: string[];
};

export type ActionToken = "CHECK" | "BET_25" | "BET_33" | "BET_66" | "BET_75";

export type MixedStrategy = Record<ActionToken, number>;

export type SpotOutput = {
  heroHand: string;
  board: string;
  texture: string;
  recommendedStrategy: MixedStrategy;
  reason: string;
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

function recommendStrategy(input: SpotInput, texture: string): { strategy: MixedStrategy; reason: string } {
  const base = input.preflopAction.toLowerCase();
  const tags = input.opponentTags.map((t) => t.toLowerCase());

  // NOTE: MVP heuristic strategy. Replaceable with solver-backed engine later.
  if (texture === "paired") {
    return {
      strategy: { CHECK: 0.35, BET_25: 0.55, BET_75: 0.1, BET_33: 0, BET_66: 0 },
      reason: "Paired boards often reduce nut advantage. Mixed small c-bets keep range wide."
    };
  }

  if (texture === "twoTone" || texture === "two-tone") {
    return {
      strategy: { CHECK: 0.5, BET_33: 0.35, BET_75: 0.15, BET_25: 0, BET_66: 0 },
      reason: "Flush draws increase checking. Mix checks with small and occasional bigger bets."
    };
  }

  if (base.includes("4bet")) {
    return {
      strategy: { CHECK: 0.25, BET_25: 0.6, BET_75: 0.15, BET_33: 0, BET_66: 0 },
      reason: "4-bet pots favor the aggressor. Small bets apply pressure while keeping bluffs." 
    };
  }

  if (tags.includes("sticky")) {
    return {
      strategy: { CHECK: 0.25, BET_66: 0.45, BET_75: 0.3, BET_25: 0, BET_33: 0 },
      reason: "Versus sticky opponents, shift toward larger polarized betting for value/bluffs."
    };
  }

  return {
    strategy: { CHECK: 0.3, BET_33: 0.55, BET_75: 0.15, BET_25: 0, BET_66: 0 },
    reason: "Default heuristic: mostly small c-bet with some checks and some bigger bets."
  };
}

export function generateSpot(input: SpotInput): SpotOutput {
  const texture = pickWeighted(
    input.flopTextureWeights,
    input.flopTexture || "rainbow"
  );
  const heroHand = randomHand();
  const board = buildBoard(texture);
  const recommendation = recommendStrategy(input, texture);

  return {
    heroHand,
    board,
    texture,
    recommendedStrategy: recommendation.strategy,
    reason: recommendation.reason
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
