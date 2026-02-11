"use client";

import { useMemo, useState } from "react";

type Opponent = {
  id: string;
  name: string;
  notes: string;
  hands: number;
  vpipCount: number;
  pfrCount: number;
  threeBetCount: number;
  cbetCount: number;
};

function pct(count: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

export default function OpponentsPanel({ initialOpponents }: { initialOpponents: Opponent[] }) {
  const [opponents, setOpponents] = useState<Opponent[]>(initialOpponents);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string>(initialOpponents[0]?.id ?? "");
  const [rawText, setRawText] = useState("PREFLOP: R C\nFLOP: CB");
  const [loading, setLoading] = useState(false);

  const selectedOpponent = useMemo(
    () => opponents.find((o) => o.id === selected) ?? null,
    [opponents, selected]
  );

  async function refresh() {
    const res = await fetch("/api/opponents");
    const data = await res.json();
    setOpponents(data);
    if (!selected && data[0]?.id) setSelected(data[0].id);
  }

  async function createOpponent() {
    setLoading(true);
    await fetch("/api/opponents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, notes })
    });
    setName("");
    setNotes("");
    await refresh();
    setLoading(false);
  }

  async function importHands() {
    if (!selected) return;
    setLoading(true);
    await fetch("/api/opponents/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponentId: selected, rawText })
    });
    await refresh();
    setLoading(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Create</h2>
        <div className="space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={3} />
          <button onClick={createOpponent} disabled={loading || !name.trim()}>
            Create opponent
          </button>
        </div>

        <h2 className="text-lg font-semibold pt-4">List</h2>
        <div className="space-y-2">
          {opponents.length === 0 && <p className="text-sm text-white/60">No opponents yet.</p>}
          {opponents.map((o) => (
            <button
              key={o.id}
              className={`w-full text-left px-3 py-2 rounded border ${
                selected === o.id ? "border-accent bg-white/5" : "border-white/10 bg-black/20"
              }`}
              onClick={() => setSelected(o.id)}
              type="button"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{o.name}</span>
                <span className="text-xs text-white/50">{o.hands} hands</span>
              </div>
              <div className="text-xs text-white/60">VPIP {pct(o.vpipCount, o.hands)} · PFR {pct(o.pfrCount, o.hands)} · 3B {pct(o.threeBetCount, o.hands)} · CB {pct(o.cbetCount, o.hands)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Import hand history (simple format)</h2>
        {!selectedOpponent && <p className="text-sm text-white/60">Select an opponent first.</p>}
        {selectedOpponent && (
          <>
            <div className="text-sm text-white/70">
              Updating: <span className="font-semibold">{selectedOpponent.name}</span>
            </div>
            <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={10} />
            <div className="text-xs text-white/50">
              Supported tokens (MVP): PREFLOP: R | C | 3B ; FLOP: CB. One hand starts with a PREFLOP line.
            </div>
            <button onClick={importHands} disabled={loading || !rawText.trim()}>
              Import & update stats
            </button>
          </>
        )}
      </div>
    </div>
  );
}
