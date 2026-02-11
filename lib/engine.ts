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

export type SpotOutput = {
  heroHand: string;
  board: string;
  texture: string;
  recommendedAction: string;
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

function recommendAction(input: SpotInput, texture: string) {
  const base = input.preflopAction.toLowerCase();
  const tags = input.opponentTags.map((t) => t.toLowerCase());

  if (texture === "paired") {
    return {
      action: "Range bet 25%",
      reason: "Paired boards reduce nut advantage; small c-bet keeps range wide."
    };
  }

  if (texture === "twoTone" || texture === "two-tone") {
    return {
      action: "Check or 33% c-bet",
      reason: "Flush draws increase check frequency; mix small bets with checks."
    };
  }

  if (base.includes("4bet")) {
    return {
      action: "Small c-bet 25%",
      reason: "4-bet pots favor the aggressor; small sizing pressures capped ranges."
    };
  }

  if (tags.includes("sticky")) {
    return {
      action: "Polar bet 66%",
      reason: "Sticky opponents overcall; polarize and size up for value/bluffs."
    };
  }

  return {
    action: "C-bet 33%",
    reason: "Standard strategy on low-connected rainbow boards."
  };
}

export function generateSpot(input: SpotInput): SpotOutput {
  const texture = pickWeighted(
    input.flopTextureWeights,
    input.flopTexture || "rainbow"
  );
  const heroHand = randomHand();
  const board = buildBoard(texture);
  const recommendation = recommendAction(input, texture);

  return {
    heroHand,
    board,
    texture,
    recommendedAction: recommendation.action,
    reason: recommendation.reason
  };
}

export function gradeAction(userAction: string, recommendedAction: string) {
  const user = userAction.toLowerCase();
  const rec = recommendedAction.toLowerCase();
  if (user === rec) return "CORRECT" as const;
  if (user.includes("check") && rec.includes("check")) return "CORRECT" as const;
  if (user.includes("bet") && rec.includes("bet")) return "DEVIATION" as const;
  return "WRONG" as const;
}
