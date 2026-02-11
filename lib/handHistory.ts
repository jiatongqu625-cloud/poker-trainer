export type ParsedStats = {
  hands: number;
  vpip: number;
  pfr: number;
  threeBet: number;
  cbet: number;
};

const PREFLOP_REGEX = /PREFLOP\s*:(.*)/i;
const FLOP_REGEX = /FLOP\s*:(.*)/i;

function normalizeActions(line: string) {
  return line
    .replace(/[,|]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function hasAction(tokens: string[], actions: string[]) {
  return tokens.some((token) => actions.includes(token.toUpperCase()));
}

export function parseHandHistory(raw: string): ParsedStats {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let hands = 0;
  let vpip = 0;
  let pfr = 0;
  let threeBet = 0;
  let cbet = 0;

  let currentPreflop: string[] = [];
  let currentFlop: string[] = [];

  for (const line of lines) {
    const preflop = line.match(PREFLOP_REGEX);
    const flop = line.match(FLOP_REGEX);
    if (preflop) {
      if (currentPreflop.length || currentFlop.length) {
        hands += 1;
        if (hasAction(currentPreflop, ["C", "R", "3B"])) vpip += 1;
        if (hasAction(currentPreflop, ["R", "3B"])) pfr += 1;
        if (hasAction(currentPreflop, ["3B"])) threeBet += 1;
        if (hasAction(currentFlop, ["CB"])) cbet += 1;
      }
      currentPreflop = normalizeActions(preflop[1]);
      currentFlop = [];
      continue;
    }
    if (flop) {
      currentFlop = normalizeActions(flop[1]);
    }
  }

  if (currentPreflop.length || currentFlop.length) {
    hands += 1;
    if (hasAction(currentPreflop, ["C", "R", "3B"])) vpip += 1;
    if (hasAction(currentPreflop, ["R", "3B"])) pfr += 1;
    if (hasAction(currentPreflop, ["3B"])) threeBet += 1;
    if (hasAction(currentFlop, ["CB"])) cbet += 1;
  }

  return { hands, vpip, pfr, threeBet, cbet };
}
