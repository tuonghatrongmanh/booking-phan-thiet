"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const MARK = "__bptExitGuard";
const ARMED_KEY = "bpt_exit_guard_armed";

// Trên điện thoại: bấm nút "Quay lại" khi đang ở trang đầu tiên (sắp thoát khỏi website) thì hiện hộp
// "Bạn có muốn thoát ứng dụng không?" để khách khỏi thoát nhầm. Cách làm: sau lần chạm đầu tiên, thêm 1 mục
// lịch sử đệm cùng địa chỉ (Chrome chỉ tính mục đệm khi có thao tác chạm của người dùng); lùi về mục gốc thì hỏi.
// Lưu ý: trình duyệt KHÔNG cho web chặn nút Home / nút đa nhiệm của Android - chỉ chặn được nút Quay lại.
export default function ExitGuard() {
  const pathname = usePathname();
  const { confirm } = useDialog();
  const asking = useRef(false);
  const active = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!active) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return; // chỉ màn hình cảm ứng

    function arm() {
      try {
        if (sessionStorage.getItem(ARMED_KEY)) return;
        sessionStorage.setItem(ARMED_KEY, "1");
      } catch {
        // sessionStorage bị chặn - vẫn arm 1 lần cho trang này
      }
      window.history.replaceState({ ...window.history.state, [MARK]: "entry" }, "");
      window.history.pushState({ ...window.history.state, [MARK]: "dummy" }, "", window.location.href);
    }

    async function onPop(e: PopStateEvent) {
      if (e.state?.[MARK] !== "entry" || asking.current) return;
      asking.current = true;
      const leave = await confirm({
        title: "Thoát Booking Phan Thiết?",
        message: "Bạn có muốn thoát ứng dụng không?",
        confirmText: "Thoát",
        cancelText: "Ở lại",
      });
      asking.current = false;
      if (leave) window.history.back();
      else window.history.pushState({ ...window.history.state, [MARK]: "dummy" }, "", window.location.href);
    }

    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("popstate", onPop);
    };
  }, [active, confirm]);

  return null;
}
