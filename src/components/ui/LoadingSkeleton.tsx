"use client";

import { ReactNode, useEffect } from "react";
import { useDialog } from "@/components/ui/DialogProvider";

const SLOW_LOAD_DELAY_MS = 2000;
const SLOW_LOAD_MESSAGE =
  "Xin lỗi Quý Khách! Website đang có nhiều người truy cập, đội ngũ đang phân phối dữ liệu để mang đến trải nghiệm tốt nhất. Vui lòng đợi trong giây lát...";

// Goi trong moi loading.tsx (Suspense fallback) - neu component nay con dang hien
// (nghia la trang van chua tai xong) sau 2s, bao cho khach biet web van dang phan
// hoi, khong bi treo. Timer tu huy khi trang thuc load xong (component unmount).
export function useSlowLoadNotice() {
  const { toast } = useDialog();
  useEffect(() => {
    const timer = setTimeout(() => toast(SLOW_LOAD_MESSAGE, "info"), SLOW_LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [toast]);
}

function Block({ className = "" }: { className?: string }) {
  return <div className={`bg-slate-200/70 rounded-xl ${className}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="bg-navbar-gradient h-[82px] flex items-center">
      <div className="container-custom flex items-center justify-between w-full">
        <Block className="w-20 h-14 bg-white/20" />
        <div className="hidden lg:flex gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Block key={i} className="w-16 h-4 bg-white/20" />
          ))}
        </div>
        <Block className="w-10 h-10 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export function PageSkeletonShell({ children }: { children: ReactNode }) {
  useSlowLoadNotice();
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <HeaderSkeleton />
      {children}
    </div>
  );
}

export { Block };
