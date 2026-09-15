import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SheetRowMapper from "@/components/admin/SheetRowMapper";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function SheetSyncMappingPage({ params }: Params) {
  const { id } = await params;
  const source = await prisma.sheetSyncSource.findUnique({ where: { id } });
  if (!source) notFound();

  const places = await prisma.place.findMany({
    where: { category: { in: ["HOMESTAY", "CAR_RENTAL"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Ánh xạ: {source.name}</h1>
        <p className="text-slate-400">Chọn homestay/xe tương ứng cho từng dòng trong Google Sheets</p>
      </div>

      <SheetRowMapper
        sourceId={source.id}
        places={places.map((p) => ({ id: p.id, name: p.name, category: p.category }))}
      />
    </div>
  );
}
