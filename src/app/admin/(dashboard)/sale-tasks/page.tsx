import { prisma } from "@/lib/prisma";
import SaleTasksManager from "@/components/admin/SaleTasksManager";
import type { AdminTask } from "@/components/admin/SaleTaskRow";
import type { SaleTaskStatus } from "@/lib/sale-tasks";

export const dynamic = "force-dynamic";

export default async function AdminSaleTasksPage() {
  const [tasks, sales] = await Promise.all([
    prisma.saleTask.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { place: { select: { id: true, name: true, avatar: true, salePoints: true } } } }),
    prisma.place.findMany({ where: { category: "SALE", hidden: false }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const rows: AdminTask[] = tasks.map((t) => ({
    id: t.id,
    status: t.status as SaleTaskStatus,
    title: t.title,
    description: t.description,
    bonusPoints: t.bonusPoints,
    saleNote: t.saleNote,
    adminNote: t.adminNote,
    updatedAt: t.updatedAt.toISOString(),
    place: t.place,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Nhiệm vụ Sale</h1>
        <p className="text-slate-400">Sale xin việc để tăng điểm xếp hạng → bạn giao nhiệm vụ kèm điểm thưởng → Sale báo hoàn thành → bạn duyệt để cộng điểm.</p>
      </div>
      <SaleTasksManager tasks={rows} sales={sales} />
    </div>
  );
}
