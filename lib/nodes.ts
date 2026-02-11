export type TrainingNode =
  | "FLOP_CBET" // generic
  | "FLOP_IP_CBET"
  | "FLOP_OOP_CBET"
  | "FLOP_OOP_VS_CBET"
  | "FLOP_IP_VS_CBET"
  | "TURN_BARREL"
  | "TURN_OOP_VS_BARREL"
  | "TURN_IP_VS_BARREL"
  | "RIVER_TRIPLE_BARREL"
  | "RIVER_OOP_VS_TRIPLE"
  | "RIVER_IP_VS_TRIPLE";

export const TRAINING_NODES: { value: TrainingNode; label: string; street: "FLOP" | "TURN" | "RIVER" }[] = [
  { value: "FLOP_CBET", label: "Flop: generic c-bet node", street: "FLOP" },
  { value: "FLOP_IP_CBET", label: "Flop: IP c-bet", street: "FLOP" },
  { value: "FLOP_OOP_CBET", label: "Flop: OOP c-bet", street: "FLOP" },
  { value: "FLOP_IP_VS_CBET", label: "Flop: IP vs c-bet", street: "FLOP" },
  { value: "FLOP_OOP_VS_CBET", label: "Flop: OOP vs c-bet", street: "FLOP" },
  { value: "TURN_BARREL", label: "Turn: barrel (generic)", street: "TURN" },
  { value: "TURN_IP_VS_BARREL", label: "Turn: IP vs barrel", street: "TURN" },
  { value: "TURN_OOP_VS_BARREL", label: "Turn: OOP vs barrel", street: "TURN" },
  { value: "RIVER_TRIPLE_BARREL", label: "River: triple barrel (generic)", street: "RIVER" },
  { value: "RIVER_IP_VS_TRIPLE", label: "River: IP vs triple", street: "RIVER" },
  { value: "RIVER_OOP_VS_TRIPLE", label: "River: OOP vs triple", street: "RIVER" }
];

export const DEFAULT_NODE: TrainingNode = "FLOP_CBET";
