import { prisma } from "@/lib/prisma";
import { getUserOrNull } from "@/lib/session";
import OpponentsPanel from "./ui";

export default async function OpponentsPage() {
  const user = await getUserOrNull();
  if (!user) {
    return (
      <main className="card">
        <p className="text-sm text-white/70">Initializing session…</p>
        <p className="text-xs text-white/50 pt-2">Refresh the page if it does not proceed.</p>
      </main>
    );
  }
  const opponents = await prisma.opponentProfile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Opponents</h1>
      <OpponentsPanel initialOpponents={opponents as any} />
    </main>
  );
}
