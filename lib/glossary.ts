export type GlossaryKey =
  | "SPR"
  | "SRP"
  | "3BP"
  | "4BP"
  | "OOP"
  | "IP"
  | "CBet"
  | "RangeBet"
  | "Polar"
  | "MDF";

export const GLOSSARY: Record<GlossaryKey, { term: string; definition: string; example?: string }> = {
  SPR: {
    term: "SPR (Stack-to-Pot Ratio)",
    definition:
      "Effective stack divided by the pot size at the start of the street. Lower SPR generally means stronger value hands want to play for stacks more often; higher SPR increases the value of position and nut potential.",
    example: "If you have 80bb behind and the pot is 20bb, SPR = 4."
  },
  SRP: {
    term: "SRP (Single-Raised Pot)",
    definition: "A pot where there was an open-raise and at least one call, but no 3-bet."
  },
  "3BP": {
    term: "3BP (3-bet pot)",
    definition: "A pot where there was a 3-bet preflop and at least one caller."
  },
  "4BP": {
    term: "4BP (4-bet pot)",
    definition: "A pot where there was a 4-bet preflop and at least one caller."
  },
  OOP: {
    term: "OOP (Out of Position)",
    definition: "You act before your opponent(s) on the current street."
  },
  IP: {
    term: "IP (In Position)",
    definition: "You act after your opponent(s) on the current street."
  },
  CBet: {
    term: "C-bet (Continuation bet)",
    definition: "A bet on the flop by the player who was the last aggressor preflop."
  },
  RangeBet: {
    term: "Range bet",
    definition: "A strategy where you bet with a very large portion of your range, often using small sizing."
  },
  Polar: {
    term: "Polarized betting",
    definition:
      "A strategy where betting range is weighted toward very strong hands and bluffs, while medium-strength hands check more often."
  },
  MDF: {
    term: "MDF (Minimum Defense Frequency)",
    definition:
      "How often you must continue (call/raise) versus a bet to prevent the bettor from profiting with any two cards. In practice, MDF is a baseline; real defense depends on ranges and future streets.",
    example: "Versus a pot-size bet, MDF is 50%. Versus a half-pot bet, MDF is ~67%."
  }
};

export type StrategyExplanation = {
  title: string;
  bullets: string[];
  glossary: GlossaryKey[];
};
