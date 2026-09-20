import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import BookingCalendar from "@/components/admin/BookingCalendar";
import { getPartnerContext } from "@/lib/partner";

export const metadata = { title: "Lịch đặt | Cổng đối tác", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PartnerCalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; type?: string }> }) {
  const ctx = await getPartnerContext();
  if (!ctx) redirect("/dang-nhap?callbackUrl=/doi-tac/lich");
  const hasStay = ctx.places.some((p) => p.category === "HOMESTAY");
  const hasCar = ctx.places.some((p) => p.category === "CAR_RENTAL");
  const allowed = [...(hasStay ? (["stay"] as const) : []), ...(hasCar ? (["car"] as const) : [])];
  const sp = await searchParams;
  const type: "stay" | "car" = sp.type === "car" && hasCar ? "car" : hasStay ? "stay" : "car";

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <Link href="/doi-tac" className="text-sm font-semibold text-brand-blue hover:underline"><i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" />Cổng đối tác</Link>
        <div className="mt-4">
          {allowed.length === 0 ? (
            <p className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Bạn chưa được gán chỗ nào.</p>
          ) : (
            <BookingCalendar basePath="/doi-tac/lich" type={type} monthParam={sp.month} placeIds={ctx.places.map((p) => p.id)} allowedTypes={[...allowed]} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
