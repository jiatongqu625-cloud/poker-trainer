"use client";

import { useEffect, useState } from "react";

type MixedStrategy = Record<string, number>;

type DrillHand = {
  id: string;
  heroHand: string;
  board: string;
  texture: string;
  boardProfile?: string[];
  spr?: number | null;
  recommendedStrategy: MixedStrategy;
  reason: string;
  explanation?: { bullets: string[]; glossary: string[] } | null;
  userAction?: string | null;
  result?: string | null;
};

type Scenario = {
  id: string;
  name: string;
};

const ACTIONS = [
  { label: "Check", value: "CHECK" },
  { label: "Bet 25% pot", value: "BET_25" },
  { label: "Bet 33% pot", value: "BET_33" },
  { label: "Bet 66% pot", value: "BET_66" },
  { label: "Bet 75% pot", value: "BET_75" }
] as const;

export default function TrainPanel({ scenario }: { scenario: Scenario }) {
  const [hand, setHand] = useState<DrillHand | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<(typeof ACTIONS)[number]["value"]>(ACTIONS[0].value);

  async function loadHand() {
    setLoading(true);
    const res = await fetch("/api/train/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: scenario.id })
    });
    const data = await res.json();
    setHand(data);
    setAction(ACTIONS[0].value);
    setLoading(false);
  }

  async function submitAction() {
    if (!hand) return;
    setLoading(true);
    const res = await fetch("/api/train/next", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handId: hand.id, userAction: action })
    });
    const data = await res.json();
    setHand(data);
    setLoading(false);
  }

  async function boostSpot() {
    if (!hand) return;
    setLoading(true);
    await fetch("/api/train/spot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handId: hand.id })
    });
    setLoading(false);
  }

  useEffect(() => {
    loadHand();
  }, [scenario.id]);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Training: {scenario.name}</h2>
        <button type="button" onClick={loadHand} disabled={loading}>
          {loading ? "Generating..." : "Next hand"}
        </button>
      </div>

      {!hand && <p className="text-sm text-white/60">Generating a training hand...</p>}
      {hand && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="card">
              <p className="text-xs text-white/50">Hero hand</p>
              <p className="text-xl font-semibold">{hand.heroHand}</p>
            </div>
            <div className="card">
              <p className="text-xs text-white/50">Board</p>
              <p className="text-xl font-semibold">{hand.board}</p>
            </div>
            <div className="card">
              <p className="text-xs text-white/50">Texture</p>
              <p className="text-xl font-semibold">{hand.texture}</p>
            </div>
            <div className="card">
              <p className="text-xs text-white/50">SPR</p>
              <p className="text-xl font-semibold">{hand.spr ? hand.spr.toFixed(1) : "—"}</p>
              <p className="text-xs text-white/50">(approx)</p>
            </div>
          </div>

          {hand.boardProfile?.length ? (
            <div className="text-xs text-white/60">
              Board profile: {hand.boardProfile.join(", ")}
            </div>
          ) : null}

          <div className="card space-y-2">
            <p className="text-sm text-white/50">Recommended strategy (mix)</p>
            <div className="text-sm text-white/80 space-y-1">
              {Object.entries(hand.recommendedStrategy)
                .filter(([, w]) => Number(w) > 0)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .map(([k, w]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span>{k}</span>
                    <span className="text-white/60">{Math.round(Number(w) * 100)}%</span>
                  </div>
                ))}
            </div>
            <p className="text-sm text-white/60">{hand.reason}</p>

            {hand.explanation?.bullets?.length ? (
              <details className="pt-2">
                <summary className="cursor-pointer text-sm text-white/70">Why this strategy?</summary>
                <ul className="list-disc pl-5 text-sm text-white/70 space-y-1 pt-2">
                  {hand.explanation.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
                {hand.explanation.glossary?.length ? (
                  <p className="text-xs text-white/50 pt-2">
                    Terms: {hand.explanation.glossary.join(", ")} (definitions coming next)
                  </p>
                ) : null}
              </details>
            ) : null}
          </div>

          <div className="card space-y-2">
            <p className="text-sm text-white/50">Your action</p>
            <div className="flex flex-wrap gap-2">
              <select value={action} onChange={(event) => setAction(event.target.value as any)}>
                {ACTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={submitAction} disabled={loading}>
                Submit
              </button>
              <button type="button" className="bg-white/10 text-white" onClick={boostSpot} disabled={loading}>
                Drill this spot more
              </button>
            </div>
            {hand.result && (
              <p className="text-sm text-white/70">
                Result: {hand.result} {hand.userAction ? `(your action: ${hand.userAction})` : null}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
