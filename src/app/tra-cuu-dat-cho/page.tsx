import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import BookingLookupClient from "@/components/booking/BookingLookupClient";

export const metadata = {
  title: "Tra cứu đơn đặt phòng / thuê xe | Booking Phan Thiết",
  description: "Nhập mã đơn và số điện thoại để xem trạng thái đặt cọc giữ chỗ của bạn.",
  robots: { index: false, follow: false },
};

export default async function TraCuuDatChoPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-[560px] mx-auto px-4 py-10">
        <h1 className="font-display font-extrabold text-2xl text-slate-800 mb-1">Tra cứu đơn của bạn</h1>
        <p className="text-slate-500 text-sm mb-6">
          Nhập <strong>mã đơn</strong> (dạng BPTXXXXXX, có trong nội dung chuyển khoản/email) và số điện thoại đã đặt.
        </p>
        <BookingLookupClient initialRef={typeof ref === "string" ? ref.slice(0, 20) : ""} />
      </main>
      <Footer />
    </div>
  );
}
