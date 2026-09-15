import PendingChangesManager from "@/components/admin/PendingChangesManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = { DELETE: "Xóa", HIDE: "Ẩn", UPDATE: "Sửa" };

export default async function PendingChangesPage() {
  const items = await prisma.pendingChange.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { requestedBy: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Chờ duyệt</h1>
        <p className="text-slate-400">Các yêu cầu xóa/ẩn/sửa từ nhân viên cần bạn duyệt trước khi áp dụng lên web</p>
      </div>

      <PendingChangesManager
        initialItems={items.map((i) => ({
          id: i.id,
          action: i.action,
          actionLabel: ACTION_LABEL[i.action] ?? i.action,
          targetType: i.targetType,
          targetLabel: i.targetLabel,
          requestedByName: i.requestedBy.name,
          requestedByEmail: i.requestedBy.email,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
