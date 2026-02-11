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

export type ActionToken =
  | "FOLD"
  | "CHECK"
  | "CALL"
  | "BET_25"
  | "BET_33"
  | "BET_66"
  | "BET_75"
  | "RAISE_33"
  | "RAISE_75"
  | "JAM";

export type MixedStrategy = Partial<Record<ActionToken, number>>;

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

function pickRank(ranks: string[]) {
  return ranks[Math.floor(Math.random() * ranks.length)];
}

function buildBoard(texture: string, boardProfile: string[]) {
  const used = new Set<string>();

  const wantsWet = boardProfile.includes("wet");
  const wantsLow = boardProfile.includes("low");

  const highRanks = ["A", "K", "Q", "J", "T"];
  const lowRanks = ["9", "8", "7", "6", "5", "4", "3", "2"];
  const pool = wantsLow ? lowRanks : highRanks.concat(["9"]);

  function makeCard(rank: string, suit: string) {
    const c = `${rank}${suit}`;
    if (used.has(c)) return null;
    used.add(c);
    return c;
  }

  if (texture === "paired") {
    const rank = pickRank(pool);
    const suit1 = SUITS[Math.floor(Math.random() * SUITS.length)];
    const suit2 = SUITS.filter((s) => s !== suit1)[Math.floor(Math.random() * 3)];
    used.add(`${rank}${suit1}`);
    used.add(`${rank}${suit2}`);
    const kickerRank = pickRank(pool);
    const kickerSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const kicker = makeCard(kickerRank, kickerSuit) ?? randomCard(used);
    return `${rank}${suit1} ${rank}${suit2} ${kicker}`;
  }

  if (texture === "twoTone" || texture === "two-tone") {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const offSuit = SUITS.filter((s) => s !== suit)[Math.floor(Math.random() * 3)];

    // If wet, try to bias toward connected ranks.
    if (wantsWet) {
      const startIdx = Math.floor(Math.random() * Math.max(1, pool.length - 3));
      const seq = pool.slice(startIdx, startIdx + 3);
      const r1 = seq[0] ?? pickRank(pool);
      const r2 = seq[1] ?? pickRank(pool);
      const r3 = seq[2] ?? pickRank(pool);
      const c1 = makeCard(r1, suit) ?? randomCard(used);
      const c2 = makeCard(r2, suit) ?? randomCard(used);
      const c3 = makeCard(r3, offSuit) ?? randomCard(used);
      return `${c1} ${c2} ${c3}`;
    }

    const card1 = `${pickRank(pool)}${suit}`;
    const card2 = `${pickRank(pool)}${suit}`;
    const card3 = `${pickRank(pool)}${offSuit}`;
    return `${card1} ${card2} ${card3}`;
  }

  // rainbow / default
  if (wantsWet) {
    // Connected-ish ranks, random suits.
    const startIdx = Math.floor(Math.random() * Math.max(1, pool.length - 3));
    const seq = pool.slice(startIdx, startIdx + 3);
    const c1 = `${seq[0] ?? pickRank(pool)}${SUITS[Math.floor(Math.random() * SUITS.length)]}`;
    const c2 = `${seq[1] ?? pickRank(pool)}${SUITS[Math.floor(Math.random() * SUITS.length)]}`;
    const c3 = `${seq[2] ?? pickRank(pool)}${SUITS[Math.floor(Math.random() * SUITS.length)]}`;
    return `${c1} ${c2} ${c3}`;
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

  const node = String(input.trainingNode ?? "FLOP_CBET");

  const bullets = [
    `Training node: ${node}.`,
    `Pot type: ${potType}. Estimated pot at flop: ~${potAtFlop.toFixed(1)}bb.`,
    `Effective stack: ${input.stackBb}bb → SPR ≈ ${spr.toFixed(1)}.`
  ];

  const glossary = ["SPR", potType];

  // Node-aware tweaks (MVP):
  if (node.includes("VS_CBET")) {
    bullets.push("This node is about defending vs a continuation bet: actions are typically Fold/Call/Raise (not betting). Use MDF as a baseline, then adjust by range/position/runouts.");
    glossary.push("CBet", "MDF");
  }
  if (node.includes("VS_BARREL") || node.includes("VS_TRIPLE")) {
    bullets.push("Facing turn/river barrels often shifts toward more polarized continue ranges and stronger blocker considerations.");
    glossary.push("MDF", "Polar");
  }
  if (node.includes("BARREL") || node.includes("TRIPLE")) {
    bullets.push("Turn/river barreling nodes depend heavily on equity realization and blockers; ranges often polarize as streets progress.");
    glossary.push("Polar");
  }

  // NOTE: MVP heuristic strategy. Replaceable with solver-backed engine later.
  // Defense nodes: output Fold/Call/Raise mix.
  if (node.includes("VS_CBET") || node.includes("VS_BARREL") || node.includes("VS_TRIPLE")) {
    const isXRNode = node.includes("XR");
    const base: MixedStrategy = isXRNode
      ? { FOLD: 0.4, CALL: 0.0, RAISE_75: 0.6 }
      : { FOLD: 0.25, CALL: 0.6, RAISE_75: 0.15 };
    if (texture === "twoTone" || texture === "two-tone") {
      base.FOLD = 0.22;
      base.CALL = 0.58;
      base.RAISE_75 = 0.2;
    }
    if (texture === "paired") {
      base.FOLD = 0.28;
      base.CALL = 0.62;
      base.RAISE_75 = 0.1;
    }
    return {
      strategy: base,
      reason: isXRNode
        ? "In check-raise nodes, your range is polarized: raise strong hands and bluffs, fold the weakest."
        : "Versus a c-bet, defend mostly by calling and some raising; fold the weakest portion.",
      bullets: [
        ...bullets,
        isXRNode
          ? "Check-raising constructs a polar range and pressures the bettor's medium-strength hands."
          : "MDF is a baseline; raise more on textures that favor your nut advantage and on turns that shift equity."
      ],
      glossary: isXRNode ? [...glossary, "Polar"] : glossary,
      spr
    };
  }

  if (texture === "paired") {
    return {
      strategy: { CHECK: 0.35, BET_25: 0.55, BET_75: 0.1 },
      reason: "Paired boards often reduce nut advantage. Mixed small c-bets keep ranges wide.",
      bullets: [...bullets, "Paired textures often reduce strong hand density, so small bets + checks are common."],
      glossary: [...glossary, "CBet", "RangeBet"],
      spr
    };
  }

  if (texture === "twoTone" || texture === "two-tone") {
    return {
      strategy: { CHECK: 0.5, BET_33: 0.35, BET_75: 0.15 },
      reason: "Two-tone boards add flush draws: increase checking and keep some big bets.",
      bullets: [...bullets, "Flush draws increase the value of checking and protect your checking range."],
      glossary: [...glossary, "CBet"],
      spr
    };
  }

  if (potType === "4BP" || base.includes("4bet")) {
    return {
      strategy: { CHECK: 0.25, BET_25: 0.6, BET_75: 0.15 },
      reason: "4-bet pots are typically low SPR and range-constrained; small bets are common.",
      bullets: [...bullets, "Low SPR spots often support more betting with strong overpairs/top pairs."],
      glossary: [...glossary, "CBet"],
      spr
    };
  }

  // Probe / delayed / donk nodes (MVP): prefer bigger bets less often; more checks.
  if (node.includes("PROBE") || node.includes("DELAYED") || node.includes("DONK")) {
    return {
      strategy: { CHECK: 0.5, BET_33: 0.35, BET_75: 0.15 },
      reason: node.includes("DONK")
        ? "Donk/probe/delayed nodes often use smaller sizings and higher checking to keep ranges protected."
        : "Probe/delayed nodes often use smaller sizings and higher checking to keep ranges protected.",
      bullets: [
        ...bullets,
        node.includes("DONK")
          ? "Leading into the aggressor is uncommon in many pools; use it selectively with strong hands/draws and some protection bets."
          : "When the previous street checked through, ranges are wider; prefer small bets and protect checks."
      ],
      glossary: node.includes("DONK") ? [...glossary, "Donk"] : [...glossary, "RangeBet", "Probe", "DelayedCBet"],
      spr
    };
  }

  if (tags.includes("sticky")) {
    return {
      strategy: { CHECK: 0.25, BET_66: 0.45, BET_75: 0.3 },
      reason: "Versus sticky opponents, shift toward larger polarized betting.",
      bullets: [...bullets, "If villain overcalls, larger sizings extract more value and pressure draws."],
      glossary: [...glossary, "Polar"],
      spr
    };
  }

  return {
    strategy: { CHECK: 0.3, BET_33: 0.55, BET_75: 0.15 },
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
  const board = buildBoard(texture, boardProfile);
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
  const keys = Object.keys(strategy) as ActionToken[];
  let best: ActionToken = (keys[0] ?? "CHECK") as ActionToken;
  let bestW = -1;
  keys.forEach((k) => {
    const w = strategy[k] ?? 0;
    if (w > bestW) {
      bestW = w;
      best = k;
    }
  });
  return best;
}

export function gradeAction(userAction: ActionToken, strategy: MixedStrategy, allowed?: ActionToken[]) {
  if (allowed && !allowed.includes(userAction)) return "WRONG" as const;

  const top = topAction(strategy);
  if (userAction === top) return "CORRECT" as const;

  const w = strategy[userAction] ?? 0;
  // Treat "in-range" action as deviation, not hard-wrong.
  if (w >= 0.15) return "DEVIATION" as const;

  return "WRONG" as const;
}
