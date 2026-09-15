import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import HeroTileForm from "@/components/admin/HeroTileForm";

export default async function EditHeroTilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tile = await prisma.heroTile.findUnique({ where: { id } });
  if (!tile) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa ô danh mục</h1>
      <HeroTileForm initial={tile} />
    </div>
  );
}
