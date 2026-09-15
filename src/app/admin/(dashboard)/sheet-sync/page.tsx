import { prisma } from "@/lib/prisma";
import SheetSyncManager from "@/components/admin/SheetSyncManager";

export const dynamic = "force-dynamic";

export default async function AdminSheetSyncPage() {
  const sources = await prisma.sheetSyncSource.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { mappings: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Đồng bộ Google Sheets</h1>
        <p className="text-slate-400">
          Kết nối file Google Sheets/Excel của chủ homestay/xe — hệ thống đọc màu ô để tự cập nhật còn/hết phòng, xe.
        </p>
      </div>

      <SheetSyncManager
        initialSources={sources.map((s) => ({
          id: s.id,
          name: s.name,
          sheetId: s.sheetId,
          sheetNamePattern: s.sheetNamePattern,
          lastSyncedAt: s.lastSyncedAt ? s.lastSyncedAt.toISOString() : null,
          lastSyncError: s.lastSyncError,
          mappingCount: s._count.mappings,
        }))}
      />
    </div>
  );
}
