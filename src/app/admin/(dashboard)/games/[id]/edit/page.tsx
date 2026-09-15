import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GameForm from "@/components/admin/GameForm";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa game</h1>
      <GameForm initial={game} />
    </div>
  );
}
