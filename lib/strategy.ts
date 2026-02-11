import type { ActionToken, MixedStrategy } from "@/lib/engine";

export function normalizeStrategy(strategy: MixedStrategy): MixedStrategy {
  const entries = Object.entries(strategy).filter(([, w]) => Number(w) > 0) as [ActionToken, number][];
  const sum = entries.reduce((s, [, w]) => s + Number(w), 0);
  if (!sum) return {};
  const out: MixedStrategy = {};
  for (const [k, w] of entries) out[k] = Number(w) / sum;
  return out;
}

export function restrictStrategy(strategy: MixedStrategy, allowed: ActionToken[]): MixedStrategy {
  const allowedSet = new Set(allowed);
  const filtered: MixedStrategy = {};
  for (const [k, w] of Object.entries(strategy) as [ActionToken, any][]) {
    if (!allowedSet.has(k)) continue;
    if (Number(w) <= 0) continue;
    filtered[k] = Number(w);
  }
  return normalizeStrategy(filtered);
}
