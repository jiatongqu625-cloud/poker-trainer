import type { ActionToken } from "@/lib/engine";
import { isXRNode, nodeKind } from "@/lib/nodes";

export type ActionOption = { label: string; value: ActionToken };

export const ACTIONS_BETTING: ActionOption[] = [
  { label: "Check", value: "CHECK" },
  { label: "Bet 25% pot", value: "BET_25" },
  { label: "Bet 33% pot", value: "BET_33" },
  { label: "Bet 66% pot", value: "BET_66" },
  { label: "Bet 75% pot", value: "BET_75" }
];

export const ACTIONS_DEFENSE: ActionOption[] = [
  { label: "Fold", value: "FOLD" },
  { label: "Call", value: "CALL" },
  { label: "Raise 33% pot", value: "RAISE_33" },
  { label: "Raise 75% pot", value: "RAISE_75" },
  { label: "Jam", value: "JAM" }
];

export const ACTIONS_XR: ActionOption[] = [
  { label: "Check", value: "CHECK" },
  { label: "Raise 75% pot", value: "RAISE_75" }
];

export function allowedActionsForNode(node: string): ActionOption[] {
  if (isXRNode(node)) return ACTIONS_XR;

  // Facing raises (after we bet) — still a defense/response node.
  if (node.includes("FACING_RAISE") || node.includes("VS_RAISE")) return ACTIONS_DEFENSE;

  return nodeKind(node) === "DEFENSE" ? ACTIONS_DEFENSE : ACTIONS_BETTING;
}
