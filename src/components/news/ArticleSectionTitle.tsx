// Tieu de muc dung chung cho cac khoi cuoi bai (danh gia, ban do, dich vu...) - icon
// tron mau chu dao + chu dam, giong tieu de muc trong trang chi tiet Am thuc.
export default function ArticleSectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="font-display font-bold text-lg text-food-text mb-4 flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-full bg-food-light text-food-primary flex items-center justify-center text-sm shrink-0">
        <i className={icon} aria-hidden="true" />
      </span>
      {children}
    </p>
  );
}
