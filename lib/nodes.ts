export type TrainingNode =
  // Flop — bet/check nodes
  | "FLOP_CBET" // generic
  | "FLOP_IP_CBET"
  | "FLOP_OOP_CBET"
  | "FLOP_DELAYED_CBET" // missed flop cbet, betting now is not represented yet (MVP label)
  | "FLOP_PROBE" // flop probe (label)
  | "FLOP_DONK" // flop donk bet (label)

  // Flop — defense nodes
  | "FLOP_OOP_VS_CBET"
  | "FLOP_IP_VS_CBET"
  | "FLOP_VS_CBET_XR" // check-raise node (MVP)

  // Turn
  | "TURN_BARREL"
  | "TURN_PROBE"
  | "TURN_DELAYED_CBET"
  | "TURN_OOP_VS_BARREL"
  | "TURN_IP_VS_BARREL"

  // River
  | "RIVER_TRIPLE_BARREL"
  | "RIVER_DELAYED_BARREL"
  | "RIVER_OOP_VS_TRIPLE"
  | "RIVER_IP_VS_TRIPLE";

export const TRAINING_NODES: { value: TrainingNode; label: string; street: "FLOP" | "TURN" | "RIVER" }[] = [
  { value: "FLOP_CBET", label: "Flop: generic c-bet node", street: "FLOP" },
  { value: "FLOP_IP_CBET", label: "Flop: IP c-bet", street: "FLOP" },
  { value: "FLOP_OOP_CBET", label: "Flop: OOP c-bet", street: "FLOP" },
  { value: "FLOP_DELAYED_CBET", label: "Flop: delayed c-bet (label)", street: "FLOP" },
  { value: "FLOP_PROBE", label: "Flop: probe bet (label)", street: "FLOP" },
  { value: "FLOP_DONK", label: "Flop: donk bet (label)", street: "FLOP" },

  { value: "FLOP_IP_VS_CBET", label: "Flop: IP vs c-bet", street: "FLOP" },
  { value: "FLOP_OOP_VS_CBET", label: "Flop: OOP vs c-bet", street: "FLOP" },
  { value: "FLOP_VS_CBET_XR", label: "Flop: vs c-bet (check-raise node)", street: "FLOP" },

  { value: "TURN_BARREL", label: "Turn: barrel (generic)", street: "TURN" },
  { value: "TURN_PROBE", label: "Turn: probe bet", street: "TURN" },
  { value: "TURN_DELAYED_CBET", label: "Turn: delayed c-bet", street: "TURN" },
  { value: "TURN_IP_VS_BARREL", label: "Turn: IP vs barrel", street: "TURN" },
  { value: "TURN_OOP_VS_BARREL", label: "Turn: OOP vs barrel", street: "TURN" },

  { value: "RIVER_TRIPLE_BARREL", label: "River: triple barrel (generic)", street: "RIVER" },
  { value: "RIVER_DELAYED_BARREL", label: "River: delayed barrel", street: "RIVER" },
  { value: "RIVER_IP_VS_TRIPLE", label: "River: IP vs triple", street: "RIVER" },
  { value: "RIVER_OOP_VS_TRIPLE", label: "River: OOP vs triple", street: "RIVER" }
];

export const DEFAULT_NODE: TrainingNode = "FLOP_CBET";

export type NodeKind = "BETTING" | "DEFENSE";

export function nodeKind(node: string): NodeKind {
  if (node.includes("VS_CBET") || node.includes("VS_BARREL") || node.includes("VS_TRIPLE")) return "DEFENSE";
  return "BETTING";
}

export function isXRNode(node: string) {
  return node.includes("XR");
}
