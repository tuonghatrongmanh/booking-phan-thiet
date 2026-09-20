import { prisma } from "@/lib/prisma";
import { FIELD_LABELS, type PartnerChange } from "@/lib/partner";
import { vnDay } from "@/lib/booking-report";
import { RequestActions } from "@/components/admin/PartnerAdminControls";

export const dynamic = "force-dynamic";

const STATUS = { PENDING: ["Chờ duyệt", "bg-amber-100 text-amber-700"], APPROVED: ["Đã duyệt", "bg-emerald-100 text-emerald-700"], REJECTED: ["Đã từ chối", "bg-red-100 text-red-600"] } as const;
const d = (x: Date) => vnDay(x).split("-").reverse().join("/");

function Thumb({ src, size }: { src: string; size: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`${size} rounded-lg object-cover`} />;
}

function show(key: keyof PartnerChange, v: unknown) {
  if (v === null || v === undefined || v === "") return <span className="text-slate-300">—</span>;
  if (key === "avatar") return <Thumb src={String(v)} size="w-20 h-20" />;
  if (key === "addImages") return <span className="flex flex-wrap gap-1.5">{(v as string[]).map((u) => <Thumb key={u} src={u} size="w-16 h-16" />)}</span>;
  if (key === "priceFromVnd" || key === "priceHolidayVnd") return `${Number(v).toLocaleString("vi-VN")}đ`;
  return <span className="whitespace-pre-wrap break-words">{String(v)}</span>;
}

export default async function PartnerRequestsPage() {
  const rows = await prisma.placeChangeRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { place: { select: { id: true, name: true, description: true, phone: true, avatar: true, priceFromVnd: true, priceHolidayVnd: true } }, user: { select: { name: true, email: true } } },
  });
  const ordered = [...rows.filter((r) => r.status === "PENDING"), ...rows.filter((r) => r.status !== "PENDING")];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Yêu cầu từ đối tác</h1>
        <p className="text-slate-400">Chủ homestay/xe đề xuất sửa giá, mô tả, ảnh. Nội dung chỉ hiển thị trên website sau khi bạn duyệt. Gán đối tác trong trang sửa của từng homestay/xe.</p>
      </div>
      {ordered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Chưa có yêu cầu nào.</div>
      ) : (
        ordered.map((r) => {
          const payload = r.payload as PartnerChange;
          const keys = Object.keys(payload) as (keyof PartnerChange)[];
          const current = r.place as unknown as Record<string, unknown>;
          return (
            <section key={r.id} className="bg-white rounded-2xl shadow-card p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-display font-bold text-lg text-slate-800">{r.place.name}</h2>
                <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span>
                <span className="text-sm text-slate-400">{r.user.name} · {r.user.email} · {d(r.createdAt)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="text-left text-slate-500"><tr><th className="py-1.5 pr-3 font-semibold w-40">Mục</th><th className="py-1.5 pr-3 font-semibold">Hiện tại</th><th className="py-1.5 font-semibold">Đề xuất</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 align-top">
                    {keys.map((k) => (
                      <tr key={k}>
                        <td className="py-2 pr-3 font-semibold text-slate-600">{FIELD_LABELS[k] ?? k}</td>
                        <td className="py-2 pr-3 text-slate-500">{k === "addImages" ? <span className="text-slate-300">—</span> : show(k, current[k])}</td>
                        <td className="py-2 text-slate-800 font-medium">{show(k, payload[k])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {r.status === "PENDING" ? <RequestActions id={r.id} /> : r.adminNote ? <p className="text-sm text-slate-500">Ghi chú: {r.adminNote}</p> : null}
            </section>
          );
        })
      )}
    </div>
  );
}
