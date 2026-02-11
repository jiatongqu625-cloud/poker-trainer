"use client";

import { useMemo, useState } from "react";
import { DEFAULT_NODE, TRAINING_NODES } from "@/lib/nodes";

export default function ScenarioForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const tableType = String(formData.get("tableType") || "6max");
    const players = tableType === "9max" ? 9 : 6;

    const heroPos = String(formData.get("position") || "BTN");
    const villains = String(formData.get("villainPositions") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const potType = String(formData.get("potType") || "SRP");
    const aggressor = String(formData.get("aggressor") || heroPos);
    const callers = Number(formData.get("callers") || 1);

    const trainingNode = String(formData.get("trainingNode") || DEFAULT_NODE);

    const preflopConfig = {
      potType,
      aggressor,
      heroPos,
      villains,
      callers,
      trainingNode
    };

    const preflopAction = `${potType} | Aggressor ${aggressor} | Hero ${heroPos} | Callers ${callers} | Vs ${villains.join(",") || "(unspecified)"}`;

    const boardProfileWeights = {
      dry: Number(formData.get("dry") || 0),
      wet: Number(formData.get("wet") || 0),
      high: Number(formData.get("high") || 0),
      low: Number(formData.get("low") || 0)
    };

    const payload = {
      name: formData.get("name"),
      tableType,
      position: heroPos,
      villainPositions: villains,
      stackBb: Number(formData.get("stackBb")),
      players,
      preflopAction,
      preflopConfig,
      trainingNode,
      flopTexture: formData.get("flopTexture"),
      opponentTags: String(formData.get("opponentTags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      flopTextureWeights: {
        twoTone: Number(formData.get("twoTone") || 0),
        rainbow: Number(formData.get("rainbow") || 0),
        paired: Number(formData.get("paired") || 0)
      },
      boardProfileWeights
    };

    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setMessage("Scenario created. Refresh to see it in the list.");
      event.currentTarget.reset();
    } else {
      setMessage("Failed to create scenario. Check your inputs.");
    }

    setLoading(false);
  }

  const POSITIONS_6MAX = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
  const POSITIONS_9MAX = ["UTG", "UTG1", "UTG2", "LJ", "HJ", "CO", "BTN", "SB", "BB"];

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h2 className="text-lg font-semibold">Create scenario (A/B)</h2>
      {message && <p className="text-sm text-white/70">{message}</p>}

      <div className="grid md:grid-cols-2 gap-3">
        <input name="name" placeholder="Scenario name" required />

        <select name="tableType" defaultValue="6max">
          <option value="6max">6-max</option>
          <option value="9max">9-max</option>
        </select>

        <select name="position" defaultValue="BTN">
          <optgroup label="6-max">
            {POSITIONS_6MAX.map((p) => (
              <option key={`6-${p}`} value={p}>
                {p}
              </option>
            ))}
          </optgroup>
          <optgroup label="9-max">
            {POSITIONS_9MAX.map((p) => (
              <option key={`9-${p}`} value={p}>
                {p}
              </option>
            ))}
          </optgroup>
        </select>

        <input
          name="villainPositions"
          placeholder="Villain positions (comma-separated, e.g. BB,SB)"
        />

        <input
          name="stackBb"
          type="number"
          min="10"
          defaultValue={100}
          placeholder="Effective stack (BB)"
          required
        />

        <select name="potType" defaultValue="SRP">
          <option value="SRP">SRP (single-raised pot)</option>
          <option value="3BP">3-bet pot</option>
          <option value="4BP">4-bet pot</option>
        </select>

        <input name="aggressor" placeholder="Preflop aggressor position (e.g. BTN)" />
        <input name="callers" type="number" min="0" defaultValue={1} placeholder="# of callers" />

        <select name="trainingNode" defaultValue={DEFAULT_NODE}>
          {TRAINING_NODES.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>

        <select name="flopTexture" defaultValue="rainbow">
          <option value="rainbow">Flop texture: rainbow</option>
          <option value="two-tone">Flop texture: two-tone</option>
          <option value="paired">Flop texture: paired</option>
        </select>

        <input name="opponentTags" placeholder="Opponent tags (comma-separated)" />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <input name="twoTone" type="number" step="0.05" defaultValue={0.4} placeholder="two-tone weight" />
        <input name="rainbow" type="number" step="0.05" defaultValue={0.4} placeholder="rainbow weight" />
        <input name="paired" type="number" step="0.05" defaultValue={0.2} placeholder="paired weight" />
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <input name="dry" type="number" step="0.05" defaultValue={0.5} placeholder="dry board weight" />
        <input name="wet" type="number" step="0.05" defaultValue={0.5} placeholder="wet board weight" />
        <input name="high" type="number" step="0.05" defaultValue={0.5} placeholder="high board weight" />
        <input name="low" type="number" step="0.05" defaultValue={0.5} placeholder="low board weight" />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create scenario"}
      </button>

      <p className="text-xs text-white/50">
        Notes: This editor stores both a human-readable summary and a structured preflopConfig (for type-A trees).
      </p>
    </form>
  );
}
