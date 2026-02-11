import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getOrCreateUser } from "../../lib/session";
import { safeJsonParse } from "@/lib/json";
import ScenarioForm from "./ScenarioForm";

export default async function ScenariosPage() {
  const user = await getOrCreateUser();
  const scenarios = await prisma.scenario.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }]
    },
    orderBy: [{ weight: "desc" }, { createdAt: "desc" }]
  });

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Scenarios</h1>
      <section className="grid md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{scenario.name}</h3>
              <span className="badge">Weight {scenario.weight}</span>
            </div>
            <p className="text-sm text-white/60">
              {scenario.tableType} · {scenario.position} · {scenario.stackBb}bb · {scenario.players}-handed
            </p>
            <p className="text-sm">{scenario.preflopAction}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge">Texture {scenario.flopTexture}</span>
              {safeJsonParse<string[]>((scenario as any).villainPositionsJson, []).map((p) => (
                <span key={p} className="badge">vs {p}</span>
              ))}
              {safeJsonParse<string[]>((scenario as any).opponentTagsJson, []).map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
            <Link className="badge" href={`/train/${scenario.id}`}>Start training</Link>
          </div>
        ))}
      </section>
      <ScenarioForm />
    </main>
  );
}
