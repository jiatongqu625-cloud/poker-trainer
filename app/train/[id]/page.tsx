import { prisma } from "../../../lib/prisma";
import { getOrCreateUser } from "../../../lib/session";
import TrainPanel from "./TrainPanel";

export default async function TrainPage({ params }: { params: { id: string } }) {
  const user = await getOrCreateUser();
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
