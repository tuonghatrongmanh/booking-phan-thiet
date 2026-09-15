import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* hiệu ứng sóng biển lướt ngang phía dưới, tránh màn hình trống */}
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 pointer-events-none">
        <div
          className="absolute inset-x-0 bottom-0 h-full animate-wave-scroll-slow"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath d='M0 20 C25 5 45 5 70 20 C95 35 115 35 140 20 C165 5 185 5 200 20 V40 H0 Z' fill='%23bae6fd' fill-opacity='0.6'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat-x",
            backgroundSize: "200px 100%",
            backgroundPosition: "bottom",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[85%] animate-wave-scroll"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40'%3E%3Cpath d='M0 22 C25 8 45 8 70 22 C95 36 115 36 140 22 C165 8 185 8 200 22 V40 H0 Z' fill='%2338bdf8' fill-opacity='0.45'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat-x",
            backgroundSize: "200px 100%",
            backgroundPosition: "bottom",
          }}
        />
      </div>

      <Link
        href="/"
        aria-label="Về trang chủ"
        className="relative z-10 block w-full max-w-xl px-6 cursor-pointer"
      >
        <img
          src="/images/404.png"
          alt="404 - Không tìm thấy trang"
          className="w-full h-auto select-none animate-bob drop-shadow-xl"
        />
      </Link>
    </div>
  );
}
