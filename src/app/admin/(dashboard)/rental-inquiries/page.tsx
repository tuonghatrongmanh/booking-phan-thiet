import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RentalInquiryStatusControl from "@/components/admin/RentalInquiryStatusControl";
import DepositBadge from "@/components/admin/DepositBadge";
import { isDepositExpired } from "@/lib/booking-status";
import CustomerContact from "@/components/admin/CustomerContact";
import { buildCustomerMessage } from "@/lib/booking-message";
import InquiryCard from "@/components/admin/InquiryCard";

export const dynamic = "force-dynamic";

const TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ liên hệ" },
  { value: "CONTACTED", label: "Đã liên hệ" },
  { value: "DONE", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateOnly(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminRentalInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && ["PENDING", "CONTACTED", "DONE", "CANCELLED"].includes(status) ? status : "ALL";

  const inquiries = await prisma.rentalInquiry.findMany({
    where: activeStatus === "ALL" ? {} : { status: activeStatus as "PENDING" | "CONTACTED" | "DONE" | "CANCELLED" },
    orderBy: { createdAt: "desc" },
    include: { place: { select: { name: true, avatar: true, phone: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Yêu cầu thuê xe</h1>
        <p className="text-slate-400">Danh sách khách hàng gửi yêu cầu đặt thuê xe - liên hệ xác nhận trực tiếp</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "ALL" ? "/admin/rental-inquiries" : `/admin/rental-inquiries?status=${t.value}`}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${
              activeStatus === t.value ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <p className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Không có yêu cầu nào.</p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((r) => (
            <InquiryCard
              key={r.id}
              title={r.place.name}
              subtitle={r.place.phone}
              chips={[
                { icon: "fa-regular fa-calendar", text: `${formatDateOnly(r.pickupDate)} → ${formatDateOnly(r.returnDate)}` },
                ...(r.quantity > 1 ? [{ icon: "fa-solid fa-motorcycle", text: `${r.quantity} xe`, tone: "blue" as const }] : []),
              ]}
              locationLabel="Nhận xe tại"
              location={r.pickupLocation}
              note={r.note}
              sentAt={formatDateTime(r.createdAt)}
              customer={
                <CustomerContact
                  name={r.customerName}
                  phone={r.customerPhone}
                  email={r.customerEmail}
                  message={buildCustomerMessage({
                    customerName: r.customerName,
                    placeName: r.place.name,
                    dateText: `${formatDateOnly(r.pickupDate)} - ${formatDateOnly(r.returnDate)}`,
                    detailText: `${r.quantity} xe`,
                    depositStatus: r.depositStatus,
                    depositAmount: r.depositAmount,
                    depositRef: r.depositRef,
                    cancelled: r.status === "CANCELLED",
                  })}
                />
              }
              deposit={
                <DepositBadge
                  status={r.depositStatus}
                  amount={r.depositAmount}
                  depositRef={r.depositRef}
                  reportedPaid={Boolean(r.customerReportedPaidAt)}
                  claimNote={r.paymentClaimNote}
                  claimRejected={Boolean(r.paymentClaimRejectedAt) && !r.customerReportedPaidAt}
                  claimCount={r.paymentClaimCount}
                  expired={isDepositExpired(r.createdAt)}
                  rejectUrl={`/api/admin/rental-inquiries/${r.id}/reject-claim`}
                  confirmUrl={`/api/admin/rental-inquiries/${r.id}/confirm-deposit`}
                />
              }
              status={<RentalInquiryStatusControl id={r.id} status={r.status} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
