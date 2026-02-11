import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getOrCreateUser } from "../lib/session";
import { safeJsonParse } from "@/lib/json";

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function DashboardPage() {
  const user = await getOrCreateUser();

  const recentHands = await prisma.drillHand.findMany({
    where: { session: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const total = recentHands.length;
  const correct = recentHands.filter((h) => h.result === "CORRECT").length;
  const deviations = recentHands.filter((h) => h.result === "DEVIATION").length;

  const wrongBuckets = new Map<string, number>();
  for (const hand of recentHands) {
    if (hand.result !== "WRONG") continue;
    const key = `${hand.boardTexture}-${hand.recommendedAction}`;
    wrongBuckets.set(key, (wrongBuckets.get(key) ?? 0) + 1);
  }
  const topMistakes = [...wrongBuckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <main className="space-y-6">
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-white/60">Last 50 hands</p>
          <p className="text-3xl font-semibold">{total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Accuracy</p>
          <p className="text-3xl font-semibold">{pct(correct, total)}</p>
          <p className="text-xs text-white/40">Deviation rate {pct(deviations, total)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-white/60">Top mistakes</p>
          <div className="space-y-2 text-sm">
            {topMistakes.length === 0 && <p className="text-white/40">No data yet</p>}
            {topMistakes.map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key}</span>
                <span className="text-white/60">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <div className="flex flex-wrap gap-3">
          <Link className="badge" href="/scenarios">Configure scenarios</Link>
          <Link className="badge" href="/opponents">Manage opponents</Link>
        </div>
      </section>
    </main>
  );
}
