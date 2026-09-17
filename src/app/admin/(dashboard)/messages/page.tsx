import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/current-admin";
import AdminMessagesInbox from "@/components/admin/AdminMessagesInbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const messages = await prisma.adminMessage.findMany({
    where: { toAdminId: admin.id },
    orderBy: { createdAt: "desc" },
    include: { fromAdmin: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Tin nhắn</h1>
        <p className="text-slate-400">Tin nhắn riêng từ SuperAdmin gửi cho bạn.</p>
      </div>
      <AdminMessagesInbox
        messages={messages.map((m) => ({
          id: m.id,
          message: m.message,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
          fromName: m.fromAdmin.name,
        }))}
      />
    </div>
  );
}
