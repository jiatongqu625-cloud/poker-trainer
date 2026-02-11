import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/session";
import OpponentsPanel from "./ui";

export default async function OpponentsPage() {
  const user = await getOrCreateUser();
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
