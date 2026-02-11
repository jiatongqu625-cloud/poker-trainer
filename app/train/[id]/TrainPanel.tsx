"use client";

import { useEffect, useState } from "react";

type DrillHand = {
  id: string;
  heroHand: string;
  board: string;
  texture: string;
  recommendedAction: string;
  reason: string;
  userAction?: string | null;
  result?: string | null;
};

type Scenario = {
  id: string;
  name: string;
};

const ACTIONS = [
  "Check",
  "C-bet 25%",
  "C-bet 33%",
  "Check or 33% c-bet",
  "Range bet 25%",
  "Polar bet 66%"
];

export default function TrainPanel({ scenario }: { scenario: Scenario }) {
  const [hand, setHand] = useState<DrillHand | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(ACTIONS[0]);

  async function loadHand() {
    setLoading(true);
    const res = await fetch("/api/train/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: scenario.id })
    });
    const data = await res.json();
    setHand(data);
    setAction(ACTIONS[0]);
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
        <h2 className="text-lg font-semibold">训练中: {scenario.name}</h2>
        <button type="button" onClick={loadHand} disabled={loading}>
          {loading ? "生成中..." : "下一手"}
        </button>
      </div>

      {!hand && <p className="text-sm text-white/60">生成训练手牌中...</p>}
      {hand && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="card">
              <p className="text-xs text-white/50">Hero 手牌</p>
              <p className="text-xl font-semibold">{hand.heroHand}</p>
            </div>
            <div className="card">
              <p className="text-xs text-white/50">公共牌</p>
              <p className="text-xl font-semibold">{hand.board}</p>
            </div>
            <div className="card">
              <p className="text-xs text-white/50">纹理标签</p>
              <p className="text-xl font-semibold">{hand.texture}</p>
            </div>
          </div>

          <div className="card space-y-2">
            <p className="text-sm text-white/50">推荐动作</p>
            <p className="text-lg font-semibold">{hand.recommendedAction}</p>
            <p className="text-sm text-white/60">{hand.reason}</p>
          </div>

          <div className="card space-y-2">
            <p className="text-sm text-white/50">你的选择</p>
            <div className="flex flex-wrap gap-2">
              <select value={action} onChange={(event) => setAction(event.target.value)}>
                {ACTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button type="button" onClick={submitAction} disabled={loading}>
                提交
              </button>
              <button type="button" className="bg-white/10 text-white" onClick={boostSpot} disabled={loading}>
                加练这个点
              </button>
            </div>
            {hand.result && (
              <p className="text-sm text-white/70">
                结果: {hand.result} {hand.userAction ? `(你的动作: ${hand.userAction})` : null}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
