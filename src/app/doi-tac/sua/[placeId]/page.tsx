import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PartnerEditForm from "@/components/partner/PartnerEditForm";
import { prisma } from "@/lib/prisma";
import { getPartnerContext } from "@/lib/partner";

export const metadata = { title: "Chỉnh sửa | Cổng đối tác", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PartnerEditPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const ctx = await getPartnerContext();
  if (!ctx) redirect(`/dang-nhap?callbackUrl=/doi-tac/sua/${placeId}`);
  const place = ctx.places.find((p) => p.id === placeId);
  if (!place) notFound(); // không phải chỗ của mình -> coi như không tồn tại

  const pending = await prisma.placeChangeRequest.findFirst({ where: { placeId, status: "PENDING" }, select: { id: true } });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-[640px] mx-auto px-4 py-8">
        <Link href="/doi-tac" className="text-sm font-semibold text-brand-blue hover:underline"><i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" />Cổng đối tác</Link>
        <h1 className="font-display font-extrabold text-2xl text-slate-800 mt-3">Chỉnh sửa: {place.name}</h1>
        <p className="text-slate-500 text-sm mb-5">Thay đổi của bạn <b>chưa hiển thị ngay</b>: Booking Phan Thiết sẽ xem và duyệt trước khi cập nhật lên website.</p>
        {pending ? (
          <p className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 text-sm font-semibold">Bạn đang có một yêu cầu chờ duyệt cho chỗ này. Hãy đợi admin xử lý xong rồi gửi yêu cầu tiếp theo.</p>
        ) : (
          <PartnerEditForm
            placeId={place.id}
            isCar={place.category === "CAR_RENTAL"}
            initial={{ description: place.description ?? "", priceFromVnd: place.priceFromVnd, priceHolidayVnd: place.priceHolidayVnd, phone: place.phone ?? "", avatar: place.avatar ?? "" }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
