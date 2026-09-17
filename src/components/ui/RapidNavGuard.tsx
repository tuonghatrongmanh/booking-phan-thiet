"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const WINDOW_MS = 8000; // theo doi cac lan chuyen trang trong 8s gan nhat
const THRESHOLD = 4; // >4 lan chuyen trang trong khoang do la "bam qua nhanh"
const COOLDOWN_MS = 15000; // sau khi nhac 1 lan, cho toi thieu 15s moi nhac lai

const RAPID_NAV_MESSAGE =
  "Bạn đang thao tác liên tục nhé! Vui lòng đợi trang tải xong trước khi chuyển tiếp để có trải nghiệm mượt mà hơn.";

// Bam chuyen trang qua nhanh/nhieu lan lien tuc tao them tai cho server (moi trang la
// 1 lan render+query database moi vi toan site dung force-dynamic) - nhac nhe khach
// thay vi de ho tiep tuc bam khi khong biet server dang qua tai.
export default function RapidNavGuard() {
  const pathname = usePathname();
  const { toast } = useDialog();
  const timestampsRef = useRef<number[]>([]);
  const lastWarnedAtRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const recent = timestampsRef.current.filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    timestampsRef.current = recent;

    if (recent.length > THRESHOLD && now - lastWarnedAtRef.current > COOLDOWN_MS) {
      lastWarnedAtRef.current = now;
      toast(RAPID_NAV_MESSAGE, "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
