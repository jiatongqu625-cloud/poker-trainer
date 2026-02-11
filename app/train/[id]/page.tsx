import { prisma } from "../../../lib/prisma";
import { getUserOrNull } from "../../../lib/session";
import TrainPanel from "./TrainPanel";

export default async function TrainPage({ params }: { params: { id: string } }) {
  const user = await getUserOrNull();
  if (!user) {
    return (
      <main className="card">
        <p className="text-sm text-white/70">Initializing session…</p>
        <p className="text-xs text-white/50 pt-2">Refresh the page if it does not proceed.</p>
      </main>
    );
  }
  const scenario = await prisma.scenario.findFirst({
    where: {
      id: params.id,
      OR: [{ userId: null }, { userId: user.id }]
    }
  });

  if (!scenario) {
    return (
      <main className="card">
        <p>找不到该场景。</p>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <TrainPanel scenario={{ id: scenario.id, name: scenario.name }} />
    </main>
  );
}
